from django.db import IntegrityError
from django.db.models import Count, OuterRef, Subquery, IntegerField, Exists
from django.db.models.functions import Coalesce
from django.utils import timezone

from rest_framework import status, permissions, generics, mixins
from .permissions import IsStudent, IsInstructor
from rest_framework.generics import get_object_or_404
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

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
    permission_classes = [permissions.IsAuthenticated, IsStudent]

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
    permission_classes = [permissions.IsAuthenticated, IsInstructor]

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
            ClassGroup.objects.exclude(location="")
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


class ClassSessionListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ClassSessionRowSerializer
    pagination_class = StandardPagination

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

        class_type = self.request.query_params.get("class_type") or ""
        instructor = self.request.query_params.get("instructor") or ""
        studio = self.request.query_params.get("studio") or ""
        date_from = self.request.query_params.get("date_from") or ""
        date_to = self.request.query_params.get("date_to") or ""

        if class_type:
            qs = qs.filter(group__class_type_id=class_type)

        if instructor:
            qs = qs.filter(group__primary_instructor_id=instructor)

        if studio:
            qs = qs.filter(group__location=studio)

        if date_from:
            qs = qs.filter(starts_at__date__gte=date_from)

        if date_to:
            qs = qs.filter(starts_at__date__lte=date_to)

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
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        group_id = request.data.get("group_id")
        if not group_id:
            raise ValidationError({"group_id": ["This field is required."]})

        try:
            student = request.user.student
        except Student.DoesNotExist:
            raise Conflict({"student": ["Finish registration first."]})

        group = generics.get_object_or_404(ClassGroup, pk=group_id, is_active=True)

        limit = group.capacity if group.capacity is not None else group.class_type.default_capacity
        active_count = Enrollment.objects.filter(group=group, status=Enrollment.Status.ACTIVE).count()
        if limit > 0 and active_count >= limit:
            raise Conflict({"group": ["Brak miejsc w tej grupie."]})

        enrollment, created = Enrollment.objects.get_or_create(
            student=student,
            group=group,
            defaults={"status": Enrollment.Status.ACTIVE},
        )

        if not created and enrollment.status != Enrollment.Status.ACTIVE:
            enrollment.status = Enrollment.Status.ACTIVE
            enrollment.cancelled_at = None
            enrollment.save(update_fields=["status", "cancelled_at"])

        return Response({"ok": True}, status=status.HTTP_200_OK)


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
