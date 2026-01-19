from django.db import IntegrityError, transaction
from django.db.models import (
    OuterRef, Subquery, IntegerField, Exists, Q, Count, Value, BooleanField)
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.password_validation import validate_password
from django.db.models.functions import Coalesce
from django.contrib.auth import get_user_model
from django.utils import timezone
import django_filters

from rest_framework.exceptions import APIException, ValidationError, PermissionDenied
from rest_framework import status, generics, permissions, mixins, viewsets
from rest_framework.generics import get_object_or_404
from common import utils
from rest_framework.response import Response
from rest_framework.views import APIView
import datetime
from django_filters.rest_framework import DjangoFilterBackend

from .permissions import (
    IsStudent,
    IsAdmin,
    IsAdminOrStudentReadOnly,
    HasStudentRole,
    HasInstructorRole,
    IsAdminOrInstructorRole)

from .models import (
    Student,
    ClassType,
    Instructor,
    ClassGroup,
    ClassSession,
    Enrollment,
    Location,
    AttendanceRecord)
from .serializers import (
    StudentSerializer,
    InstructorSerializer,
    ClassTypeMiniSerializer,
    InstructorMiniSerializer,
    ClassSessionRowSerializer,
    ClassGroupReadSerializer,
    ClassGroupWriteSerializer,
    LocationSerializer,
    AccountViewSerializer,
    AdminStudentCreatePayloadSerializer,
    AdminInstructorCreatePayloadSerializer,
    AdminStudentUpdateSerializer,
    AdminInstructorUpdateSerializer,
    AttendanceRecordRowSerializer,
    AttendanceSavePayloadSerializer,
    ClassSessionAdminReadSerializer,
    ClassSessionAdminWriteSerializer,
)

User = get_user_model()


def _add_role(user, code: str):
    Role = user.roles.model
    role = Role.objects.filter(code=code).first()
    if not role:
        raise ValidationError({"account": [f'Role "{code}" not found in DB. Create/seed roles first.']})
    user.roles.add(role)


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

    def get_permissions(self):
        if self.request.method == "POST" and IsAdmin().has_permission(self.request, self):
            return [IsAdmin()]
        return [HasStudentRole()]

    def post(self, request, *args, **kwargs):
        if IsAdmin().has_permission(request, self):
            payload = AdminStudentCreatePayloadSerializer(data=request.data)
            payload.is_valid(raise_exception=True)
            student_data = payload.validated_data["student"]
            password = payload.validated_data["password"]

            try:
                validate_password(password)
            except DjangoValidationError as e:
                raise ValidationError({"password": list(e.messages)})

            with transaction.atomic():
                try:
                    create_user = getattr(User.objects, "create_user", None)
                    if callable(create_user):
                        user = create_user(email=student_data["email"], password=password)
                        user.is_active = student_data["is_active"]
                        user.save(update_fields=["is_active"])
                    else:
                        user = User(email=student_data["email"], is_active=student_data["is_active"])
                        user.set_password(password)
                        user.save()

                    _add_role(user, "student")

                except IntegrityError:
                    raise Conflict({"account": ["Email is already used."]})

                student = Student.objects.create(
                    account=user,
                    first_name=student_data["first_name"],
                    last_name=student_data["last_name"],
                    date_of_birth=student_data.get("date_of_birth"),
                    phone=student_data.get("phone", ""),
                )

            return Response(
                {
                    "email": user.email,
                    "is_active": user.is_active,
                    "first_name": student.first_name,
                    "last_name": student.last_name,
                    "date_of_birth": student.date_of_birth,
                    "phone": student.phone,
                    "id": str(student.id),
                },
                status=status.HTTP_201_CREATED,
            )

        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        try:
            serializer.save()
        except IntegrityError:
            raise Conflict({"account": ["Information already provided for this account."]})

    def get_object(self):
        return get_object_or_404(Student, account=self.request.user)


class InstructorView(CreateUpdateRetrieveAPIView):
    serializer_class = InstructorSerializer

    def get_permissions(self):
        if self.request.method == "POST" and IsAdmin().has_permission(self.request, self):
            return [IsAdmin()]
        return [HasInstructorRole()]

    def post(self, request, *args, **kwargs):
        if IsAdmin().has_permission(request, self):
            payload = AdminInstructorCreatePayloadSerializer(data=request.data)
            payload.is_valid(raise_exception=True)
            instructor_data = payload.validated_data["instructor"]
            password = payload.validated_data["password"]

            try:
                validate_password(password)
            except DjangoValidationError as e:
                raise ValidationError({"password": list(e.messages)})

            with transaction.atomic():
                try:
                    create_user = getattr(User.objects, "create_user", None)
                    if callable(create_user):
                        user = create_user(email=instructor_data["email"], password=password)
                        user.is_active = instructor_data["is_active"]
                        user.save(update_fields=["is_active"])
                    else:
                        user = User(email=instructor_data["email"], is_active=instructor_data["is_active"])
                        user.set_password(password)
                        user.save()

                    _add_role(user, "instructor")

                except IntegrityError:
                    raise Conflict({"account": ["Email is already used."]})

                inst = Instructor.objects.create(
                    account=user,
                    first_name=instructor_data["first_name"],
                    last_name=instructor_data["last_name"],
                    short_bio=instructor_data.get("short_bio", ""),
                    phone=instructor_data.get("phone", ""),
                )

            return Response(
                {
                    "email": user.email,
                    "is_active": user.is_active,
                    "first_name": inst.first_name,
                    "last_name": inst.last_name,
                    "short_bio": inst.short_bio,
                    "phone": inst.phone,
                    "id": str(inst.id),
                },
                status=status.HTTP_201_CREATED,
            )

        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        try:
            serializer.save()
        except IntegrityError:
            raise Conflict({"account": ["Information already provided for this account."]})

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


class ProductFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name="starts_at",
                                          lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name="starts_at",
                                        lookup_expr='lte')
    location = django_filters.NumberFilter(field_name="group__location")
    primary_instructor = django_filters.NumberFilter(field_name="group__primary_instructor")
    class_type = django_filters.NumberFilter(field_name="group__class_type")

    class Meta:
        model = ClassSession
        fields = []


class ClassSessionListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ClassSessionRowSerializer
    pagination_class = utils.StandardPagination
    filterset_class = ProductFilter
    filter_backends = [DjangoFilterBackend]

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
        )

        if not IsAdmin().has_permission(self.request, self):
            qs = qs.filter(status=ClassSession.Status.PLANNED)

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
    pagination_class = utils.StandardPagination
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

        student = getattr(self.request.user, 'student', None)
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
        return qs


class AccountFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(method="filter_name")
    surname = django_filters.CharFilter(method="filter_surname")

    accountType = django_filters.CharFilter(method="filter_role")
    email = django_filters.CharFilter(field_name="email", lookup_expr="icontains")

    is_active = django_filters.BooleanFilter(field_name="is_active")

    class Meta:
        model = User
        fields = []

    def filter_name(self, qs, _name, value):
        if not value:
            return qs
        return qs.filter(
            Q(email__icontains=value)
            | Q(student__first_name__icontains=value)
            | Q(student__last_name__icontains=value)
            | Q(instructor__first_name__icontains=value)
            | Q(instructor__last_name__icontains=value)
        ).distinct()

    def filter_surname(self, qs, _name, value):
        if not value:
            return qs
        return qs.filter(
            Q(student__last_name__icontains=value)
            | Q(instructor__last_name__icontains=value)
        ).distinct()

    def filter_role(self, qs, _name, value):
        if not value:
            return qs
        if value == "instruktor":
            value = "instructor"
        return qs.filter(roles__code=value).distinct()


class AccountViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAdmin]
    serializer_class = AccountViewSerializer
    pagination_class = utils.StandardPagination
    filterset_class = AccountFilter

    def get_queryset(self):
        return (
            User.objects.all()
            .select_related("student", "instructor", "student__pass_product")
            .prefetch_related("roles")
        )

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])


class StudentAdminDetailView(APIView):
    permission_classes = [IsAdmin]

    def put(self, request, pk):
        student = get_object_or_404(
            Student.objects.select_related("account"),
            account__pk=pk,
        )

        data_in = request.data.copy()
        if data_in.get("date_of_birth") == "":
            data_in["date_of_birth"] = None

        s = AdminStudentUpdateSerializer(data=data_in)
        s.is_valid(raise_exception=True)
        data = s.validated_data

        if student.account:
            if "email" in data:
                student.account.email = data["email"]
            if "is_active" in data:
                student.account.is_active = data["is_active"]
            try:
                student.account.save()
            except IntegrityError:
                raise Conflict({"account": ["Email is already used."]})

        for f in ("first_name", "last_name", "date_of_birth", "phone", "pass_product"):
            if f in data:
                setattr(student, f, data[f])
        student.save()

        return Response({
            "email": student.account.email if student.account else None,
            "is_active": student.account.is_active if student.account else None,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "date_of_birth": student.date_of_birth,
            "phone": student.phone,
            "id": str(student.id),
        })


class InstructorAdminDetailView(APIView):
    permission_classes = [IsAdmin]

    def put(self, request, pk):
        inst = get_object_or_404(
            Instructor.objects.select_related("account"),
            account__pk=pk,
        )

        s = AdminInstructorUpdateSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        data = s.validated_data

        if "email" in data:
            inst.account.email = data["email"]
        if "is_active" in data:
            inst.account.is_active = data["is_active"]
        try:
            inst.account.save()
        except IntegrityError:
            raise Conflict({"account": ["Email is already used."]})

        for f in ("first_name", "last_name", "short_bio", "phone"):
            if f in data:
                setattr(inst, f, data[f])
        inst.save()

        return Response({
            "email": inst.account.email,
            "is_active": inst.account.is_active,
            "first_name": inst.first_name,
            "last_name": inst.last_name,
            "short_bio": inst.short_bio,
            "phone": inst.phone,
            "id": str(inst.id),
        })


class StudentAttendanceListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    serializer_class = AttendanceRecordRowSerializer
    pagination_class = utils.StandardPagination

    def get_queryset(self):
        student = self.request.user.student

        qs = (
            AttendanceRecord.objects
            .select_related(
                "session",
                "session__group",
                "session__group__class_type",
                "session__group__primary_instructor",
                "session__substitute_instructor",
            )
            .filter(
                student=student,
                status=AttendanceRecord.Status.ABSENT,
            )
            .order_by("-marked_at", "-id")
        )
        return qs


class ClassSessionParticipantsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrInstructorRole]

    def _get_session_for_user(self, session_id):
        session = get_object_or_404(
            ClassSession.objects.select_related(
                "group",
                "group__class_type",
                "group__location",
                "group__primary_instructor",
                "substitute_instructor",
            ),
            pk=session_id,
        )

        if IsAdmin().has_permission(self.request, self):
            return session

        inst = getattr(self.request.user, "instructor", None)
        if inst is None:
            raise PermissionDenied("Instructor account required.")

        is_assigned = (
            session.group.primary_instructor_id == inst.id
            or session.substitute_instructor_id == inst.id
        )
        if not is_assigned:
            raise PermissionDenied("You are not assigned to this session.")

        return session

    def get(self, request, session_id: str):
        session = self._get_session_for_user(session_id)

        enrollments = (
            Enrollment.objects
            .filter(group=session.group, status=Enrollment.Status.ACTIVE)
            .select_related("student")
            .order_by("student__last_name", "student__first_name")
        )
        student_ids = [e.student_id for e in enrollments]

        records = AttendanceRecord.objects.filter(session=session, student_id__in=student_ids)
        status_by_student = {r.student_id: r.status for r in records}

        participants = []
        for e in enrollments:
            st = e.student
            st_status = status_by_student.get(st.id)

            if st_status == AttendanceRecord.Status.MAKEUP:
                st_status = AttendanceRecord.Status.EXCUSED

            participants.append({
                "student_id": str(st.id),
                "first_name": st.first_name,
                "last_name": st.last_name,
                "status": st_status or AttendanceRecord.Status.ABSENT,
            })

        can_edit = (session.status != ClassSession.Status.CANCELLED)

        return Response({
            "session": {
                "id": str(session.id),
                "starts_at": session.starts_at,
                "ends_at": session.ends_at,
                "class_type": {
                    "id": str(session.group.class_type_id),
                    "name": session.group.class_type.name,
                },
                "location": {
                    "pk": str(session.group.location_id),
                    "name": session.group.location.name,
                },
            },
            "can_edit": can_edit,
            "participants": participants,
        })

    def post(self, request, session_id: str):
        session = self._get_session_for_user(session_id)

        if session.status == ClassSession.Status.CANCELLED:
            raise PermissionDenied("Attendance is locked for cancelled sessions.")

        s = AttendanceSavePayloadSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        records_in = s.validated_data["records"]

        active_student_ids = set(
            Enrollment.objects.filter(group=session.group, status=Enrollment.Status.ACTIVE)
            .values_list("student_id", flat=True)
        )

        for r in records_in:
            if r["student_id"] not in active_student_ids:
                raise ValidationError({"records": [f"Student {r['student_id']} is not enrolled in this group."]})

        with transaction.atomic():
            for r in records_in:
                AttendanceRecord.objects.update_or_create(
                    session=session,
                    student_id=r["student_id"],
                    defaults={
                        "status": r["status"],
                        "marked_by": request.user,
                    },
                )

        return Response({"ok": True}, status=status.HTTP_200_OK)


class AdminClassSessionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    queryset = ClassSession.objects.select_related(
        "group",
        "group__class_type",
        "group__location",
        "group__primary_instructor",
        "substitute_instructor",
    ).all()

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return ClassSessionAdminWriteSerializer
        return ClassSessionAdminReadSerializer

    def _get_or_create_group(self, class_type, instructor, location, date, start_time, end_time):
        weekday = int(date.isoweekday())
        group = (
            ClassGroup.objects.filter(
                class_type=class_type,
                primary_instructor=instructor,
                location=location,
                weekday=weekday,
                start_time=start_time,
                end_time=end_time,
                start_date=date,
                end_date=date,
            )
            .order_by("-created_at")
            .first()
        )
        if group:
            return group

        return ClassGroup.objects.create(
            name=f"{class_type.name}",
            class_type=class_type,
            primary_instructor=instructor,
            weekday=weekday,
            start_time=start_time,
            end_time=end_time,
            location=location,
            start_date=date,
            end_date=date,
            is_active=True,
        )

    def create(self, request, *args, **kwargs):
        s = ClassSessionAdminWriteSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data

        class_type = ClassType.objects.get(pk=d["class_type"])
        instructor = Instructor.objects.get(pk=d["instructor"])
        location = Location.objects.get(pk=d["location"])

        group = self._get_or_create_group(class_type, instructor, location, d["date"], d["start_time"], d["end_time"])

        starts_at = timezone.make_aware(datetime.datetime.combine(d["date"], d["start_time"]))
        ends_at = timezone.make_aware(datetime.datetime.combine(d["date"], d["end_time"]))

        session = ClassSession.objects.create(
            group=group,
            starts_at=starts_at,
            ends_at=ends_at,
            status=ClassSession.Status.PLANNED,
            notes=d.get("notes", ""),
        )
        return Response(ClassSessionAdminReadSerializer(session).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        session = self.get_object()
        s = ClassSessionAdminWriteSerializer(data=request.data, context={"session_id": session.pk})
        s.is_valid(raise_exception=True)
        d = s.validated_data

        class_type = ClassType.objects.get(pk=d["class_type"])
        instructor = Instructor.objects.get(pk=d["instructor"])
        location = Location.objects.get(pk=d["location"])

        group = self._get_or_create_group(class_type, instructor, location, d["date"], d["start_time"], d["end_time"])

        session.group = group
        session.starts_at = timezone.make_aware(datetime.datetime.combine(d["date"], d["start_time"]))
        session.ends_at = timezone.make_aware(datetime.datetime.combine(d["date"], d["end_time"]))
        session.notes = d.get("notes", "")
        session.save()

        return Response(ClassSessionAdminReadSerializer(session).data, status=status.HTTP_200_OK)
