from django.db import IntegrityError
from django.db.models import Count, OuterRef, Subquery, IntegerField, Exists
from django.db.models.functions import Coalesce
from django.utils import timezone
import django_filters

from rest_framework.exceptions import APIException, ValidationError
from rest_framework import status, generics, permissions, mixins, viewsets
from rest_framework.generics import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import IsStudent, IsInstructor, IsAdminOrReadOnly
from .services import enroll_student

from .models import (
    Student,
    ClassType,
    Instructor,
    ClassGroup,
    ClassSession,
    Enrollment)
from .serializers import (
    StudentSerializer,
    InstructorSerializer,
    ClassTypeMiniSerializer,
    InstructorMiniSerializer,
    ClassSessionRowSerializer,
    ClassGroupReadSerializer,
    ClassGroupWriteSerializer
)


class Conflict(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Resource conflict detected.'
    default_code = 'conflict'


class CreateUpdateRetrieveAPIView(
        mixins.CreateModelMixin,
        generics.RetrieveUpdateAPIView):
    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


class StudentView(CreateUpdateRetrieveAPIView):
    serializer_class = StudentSerializer
    permission_classes = [IsStudent]

    def perform_create(self, serializer):
        try:
            serializer.save()
        except IntegrityError:
            raise Conflict({'account': ['Information already provided '
                                        'for this account.']})

    def get_object(self):
        return get_object_or_404(Student, account=self.request.user)


class InstructorView(CreateUpdateRetrieveAPIView):
    serializer_class = InstructorSerializer
    permission_classes = [IsInstructor]

    def perform_create(self, serializer):
        try:
            serializer.save()
        except IntegrityError:
            raise Conflict({'account': ['Information already provided '
                                        'for this account.']})

    def get_object(self):
        return get_object_or_404(Instructor, account=self.request.user)


class ClassFiltersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        class_types = ClassType.objects.filter(is_active=True).order_by("name")
        instructors = Instructor.objects.filter(is_active=True).order_by("last_name", "first_name")
        studios = (
            ClassGroup.objects
            .exclude(location__isnull=True)
            .values_list("location", flat=True)
            .distinct()
            .order_by("location")
        )

        return Response(
            {
                "class_types": ClassTypeMiniSerializer(class_types, many=True).data,
                "instructors": InstructorMiniSerializer(instructors, many=True).data,
                "studios": list(studios),
            }
        )


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class ProductFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name="starts_at",
                                          lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name="starts_at",
                                        lookup_expr='lte')

    class Meta:
        model = ClassSession
        fields = ['group__class_type', 'group__primary_instructor',
                  'group__location', 'date_from', 'date_to']


class ClassSessionListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ClassSessionRowSerializer
    pagination_class = StandardPagination
    filterset_class = ProductFilter

    def _get_student_or_none(self):
        try:
            return self.request.user.student
        except Student.DoesNotExist:
            return None

    def get_queryset(self):
        qs = (
            ClassSession.objects
            .select_related(
                "group",
                "group__class_type",
                "group__primary_instructor",
                "substitute_instructor",
            )
            .filter(status=ClassSession.Status.PLANNED)
        )

        enrolled_subq = (
            Enrollment.objects
            .filter(group_id=OuterRef("group_id"), status=Enrollment.Status.ACTIVE)
            .values("group_id")
            .annotate(c=Count("*"))
            .values("c")[:1]
        )
        qs = qs.annotate(enrolled=Coalesce(Subquery(enrolled_subq, output_field=IntegerField()), 0))

        student = self._get_student_or_none()
        if student is None:
            qs = qs.annotate(is_enrolled=Exists(Enrollment.objects.none()))
        else:
            qs = qs.annotate(
                is_enrolled=Exists(
                    Enrollment.objects.filter(
                        group_id=OuterRef("group_id"),
                        student=student,
                        status=Enrollment.Status.ACTIVE,
                    )
                )
            )

        return qs


class EnrollView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request):
        group = self._lock_group(request.data.get("group_id"))
        if group.is_full():
            raise Conflict({"group": ["The group is full."]})
        enrollment, _ = Enrollment.objects.update_or_create(
            student=request.user.student,
            group=group,
            defaults={
                "status": Enrollment.Status.ACTIVE,
                "cancelled_at": None
            },
        )

        return Response({"enrollment_id": enrollment.pk},
                        status=status.HTTP_200_OK)

    def _lock_group(seld, id):
        if not id:
            raise ValidationError({"group_id": ["This field is required."]})
        qs = (ClassGroup.objects
              .select_for_update()
              .select_related('class_type')
              .filter(is_active=True))
        return get_object_or_404(qs, pk=id)


class UnenrollView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        group_id = request.data.get("group_id")
        if not group_id:
            raise ValidationError({"group_id": ["This field is required."]})

        try:
            student = request.user.student
        except Student.DoesNotExist:
            raise Conflict({"student": ["Finish registration first."]})

        enrollment = Enrollment.objects.filter(student=student, group_id=group_id).first()
        if not enrollment:
            return Response({"ok": True}, status=status.HTTP_200_OK)

        enrollment.status = Enrollment.Status.RESIGNED
        enrollment.cancelled_at = timezone.now()
        enrollment.save(update_fields=["status", "cancelled_at"])

        return Response({"ok": True}, status=status.HTTP_200_OK)


class ClassGroupView(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    queryset = ClassGroup.objects.all().select_related("location")

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ClassGroupWriteSerializer
        return ClassGroupReadSerializer
