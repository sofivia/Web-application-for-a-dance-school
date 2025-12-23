from django.db import IntegrityError
from django.db.models import Count, OuterRef, Subquery, IntegerField, Exists
from django.db.models.functions import Coalesce
from django.utils import timezone
from django.db.models import Count, Q, Max, Value, BooleanField
import django_filters

from rest_framework.exceptions import APIException, ValidationError
from rest_framework import status, generics, permissions, mixins, viewsets
from rest_framework.generics import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import (
    IsStudent,
    IsInstructor,
    IsAdmin,
    IsAdminOrStudentReadOnly,
    HasStudentRole,
    HasInstructorRole)

from .models import (
    Student,
    ClassType,
    Instructor,
    ClassGroup,
    ClassSession,
    Enrollment,
    Location)
from .serializers import (
    StudentSerializer,
    InstructorSerializer,
    ClassTypeMiniSerializer,
    InstructorMiniSerializer,
    ClassSessionRowSerializer,
    ClassGroupReadSerializer,
    ClassGroupWriteSerializer,
    LocationSerializer
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
    permission_classes = [HasStudentRole]

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
    permission_classes = [HasInstructorRole]

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
        locations = Location.objects.all()
        return Response(
            {
                "class_types": ClassTypeMiniSerializer(class_types, many=True).data,
                "instructors": InstructorMiniSerializer(instructors, many=True).data,
                "locations": LocationSerializer(locations, many=True).data,
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
    location = django_filters.NumberFilter(field_name="group__location")
    primary_instructor = django_filters.NumberFilter(field_name="group__primary_instructor")
    class_type = django_filters.NumberFilter(field_name="group_class_type")

    class Meta:
        model = ClassSession
        fields = []


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
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request):
        group_id = request.data.get("group_id")
        if not group_id:
            raise ValidationError({"group_id": ["This field is required."]})

        enrolments = Enrollment.objects.filter(
            student=request.user.student, group_id=group_id)
        enrolments.update(
            status=Enrollment.Status.RESIGNED, cancelled_at=timezone.now())

        return Response({"ok": True}, status=status.HTTP_200_OK)


class ProductFilter2(django_filters.FilterSet):
    starts_from = django_filters.DateFilter(field_name="starts_at",
                                            lookup_expr='gte')
    ends_to = django_filters.DateFilter(field_name="ends_at",
                                        lookup_expr='lte')

    class Meta:
        model = ClassGroup
        fields = ["location", "primary_instructor"]


class ClassGroupView(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrStudentReadOnly]
    queryset = ClassGroup.objects.all().select_related("location")
    pagination_class = StandardPagination
    filterset_class = ProductFilter2

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ClassGroupWriteSerializer
        return ClassGroupReadSerializer

    def get_queryset(self):
        if (IsAdmin().has_permission(self.request, self)):
            return ClassGroup.objects.all()

        qs = (ClassGroup.objects.select_related(
                "class_type", "primary_instructor")
              .filter(is_active=True))

        qs = qs.annotate(
            enrolled=Count(
                'enrollments',
                filter=Q(enrollments__status=Enrollment.Status.ACTIVE)))

        student = getattr(self.request.user, 'instructor', None)
        if student is not None:
            enrollment = Enrollment.objects.filter(
                student=student,
                group_id=OuterRef("pk"),
                status=Enrollment.Status.ACTIVE
            )
            qs = qs.annotate(is_enrolled=Exists(enrollment))
        else:
            qs = qs.annotate(is_enrolled=Value(False,
                                               output_field=BooleanField()))
