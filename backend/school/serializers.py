from django.apps import apps
from django.contrib.auth import get_user_model
from billing.serializers import PassProductSerializer
from rest_framework import serializers
import datetime
from django.utils import timezone
from django.db.models import Q
from django.db import transaction
from .services import weekdays

from .models import (
    Student,
    Instructor,
    ClassType,
    ClassSession,
    ClassGroup,
    Location,
    AttendanceRecord
)

User = get_user_model()


class StudentSerializer(serializers.ModelSerializer):
    account = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Student
        fields = (
            "id",
            "account",
            "first_name",
            "last_name",
            "date_of_birth",
            "phone",
        )
        read_only_fields = ("id",)


class InstructorSerializer(serializers.ModelSerializer):
    account = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Instructor
        fields = (
            "id",
            "account",
            "first_name",
            "last_name",
            "short_bio",
            "phone",
        )
        read_only_fields = ("id",)


class StudentInfoSerializer(serializers.ModelSerializer):
    pass_product = PassProductSerializer(read_only=True, allow_null=True)

    class Meta:
        model = Student
        fields = ("id", "first_name", "last_name", "date_of_birth", "phone")
        read_only_fields = ("id",)


class InstructorInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instructor
        fields = ("id", "first_name", "last_name", "short_bio", "phone")
        read_only_fields = ("id",)


class AccountViewSerializer(serializers.ModelSerializer):
    pk = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)

    studentInfo = StudentInfoSerializer(
        source="student", read_only=True, allow_null=True
    )
    instructorInfo = InstructorInfoSerializer(
        source="instructor", read_only=True, allow_null=True
    )

    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "pk",
            "email",
            "is_active",
            "role",
            "studentInfo",
            "instructorInfo",
        )

    def get_role(self, obj):
        codes = set(obj.roles.values_list("code", flat=True))

        for r in ("admin", "instructor", "student"):
            if r in codes:
                return r

        return next(iter(codes), "")


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ("pk", "name")


class ClassTypeMiniSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    class Meta:
        model = ClassType
        fields = ("id", "name", "level", "duration_minutes")


class InstructorMiniSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    class Meta:
        model = Instructor
        fields = ("id", "first_name", "last_name")


class ClassSessionRowSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    class_type = ClassTypeMiniSerializer(
        source="group.class_type", read_only=True
    )

    instructor = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()

    limit = serializers.SerializerMethodField()
    enrolled = serializers.IntegerField(read_only=True)
    is_enrolled = serializers.BooleanField(read_only=True)

    class Meta:
        model = ClassSession
        fields = (
            "id",
            "group_id",
            "starts_at",
            "ends_at",
            "class_type",
            "instructor",
            "location",
            "limit",
            "enrolled",
            "is_enrolled",
        )

    def get_instructor(self, obj):
        inst = obj.substitute_instructor or obj.group.primary_instructor
        if not inst:
            return None
        return InstructorMiniSerializer(inst).data

    def get_location(self, obj):
        return LocationSerializer(obj.group.location).data or None

    def get_limit(self, obj):
        if obj.group.capacity is not None:
            return obj.group.capacity
        return obj.group.class_type.default_capacity


class ClassGroupReadSerializer(serializers.ModelSerializer):
    primary_instructor = InstructorMiniSerializer()
    location = LocationSerializer()
    is_enrolled = serializers.BooleanField(read_only=True)

    class Meta:
        model = ClassGroup
        fields = (
            "pk",
            "name",
            "primary_instructor",
            "weekday",
            "start_time",
            "end_time",
            "location",
            "effective_capacity",
            "nr_enrolled",
            "start_date",
            "end_date",
            "is_active",
            "is_enrolled",
        )
        read_only_fields = fields


class ClassGroupWriteSerializer(serializers.ModelSerializer):
    primary_instructor = serializers.PrimaryKeyRelatedField(
        queryset=Instructor.objects.filter(is_active=True)
    )

    class Meta:
        model = ClassGroup
        fields = (
            "name",
            "class_type",
            "primary_instructor",
            "weekday",
            "start_time",
            "end_time",
            "location",
            "capacity",
            "start_date",
            "end_date",
            "is_active",
        )

    @transaction.atomic
    def create(self, validated_data):
        group = super().create(validated_data)
        self._create_sessions(group, group.start_date, group.end_date)
        return group

    @transaction.atomic
    def update(self, instance, validated_data):
        group = super().update(instance, validated_data)
        now = datetime.datetime.now()
        ClassSession.objects.filter(group=group, starts_at__gte=now).delete()
        self._create_sessions(group, now.date(), group.end_date)
        return group

    def _create_sessions(self, group, start_date, end_date):
        dates = weekdays(group.weekday, start_date, end_date)
        dates_from = [datetime.datetime.combine(d, group.start_time) for d in dates]
        dates_to = [datetime.datetime.combine(d, group.end_time) for d in dates]
        for f, t in zip(dates_from, dates_to):
            ClassSession.objects.create(group=group, starts_at=f, ends_at=t,
                                        status=ClassSession.Status.PLANNED)


class AdminStudentDataSerializer(serializers.Serializer):
    email = serializers.EmailField()
    is_active = serializers.BooleanField()
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=50)


class AdminStudentCreatePayloadSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, min_length=1)
    student = AdminStudentDataSerializer()


PassProduct = apps.get_model('billing', 'PassProduct')


class AdminStudentUpdateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    is_active = serializers.BooleanField(required=False)
    first_name = serializers.CharField(required=False, max_length=100)
    last_name = serializers.CharField(required=False, max_length=100)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=50)
    pass_product = serializers.PrimaryKeyRelatedField(
        queryset=PassProduct.objects.all(), required=False)


class AdminInstructorDataSerializer(serializers.Serializer):
    email = serializers.EmailField()
    is_active = serializers.BooleanField()
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    short_bio = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=50)


class AdminInstructorCreatePayloadSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, min_length=1)
    instructor = AdminInstructorDataSerializer()


class AdminInstructorUpdateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    is_active = serializers.BooleanField(required=False)
    first_name = serializers.CharField(required=False, max_length=100)
    last_name = serializers.CharField(required=False, max_length=100)
    short_bio = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=50)


class AttendanceRecordRowSerializer(serializers.ModelSerializer):
    classType = serializers.CharField(source="session.group.class_type.name", read_only=True)
    markedAt = serializers.DateTimeField(source="marked_at", read_only=True)
    instructorName = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceRecord
        fields = ("id", "classType", "markedAt", "instructorName")

    def get_instructorName(self, obj: AttendanceRecord) -> str:
        inst = obj.session.substitute_instructor or obj.session.group.primary_instructor
        if not inst:
            return ""
        return f"{inst.first_name} {inst.last_name}"


class AttendanceRecordInputSerializer(serializers.Serializer):
    student_id = serializers.UUIDField()
    status = serializers.ChoiceField(
        choices=[
            AttendanceRecord.Status.PRESENT,
            AttendanceRecord.Status.ABSENT,
            AttendanceRecord.Status.EXCUSED,
        ]
    )


class AttendanceSavePayloadSerializer(serializers.Serializer):
    records = AttendanceRecordInputSerializer(many=True)

    def validate_records(self, records):
        seen = set()
        for r in records:
            sid = str(r["student_id"])
            if sid in seen:
                raise serializers.ValidationError("Duplicate student_id in records.")
            seen.add(sid)
        return records


class ClassSessionAdminReadSerializer(serializers.ModelSerializer):
    class_type = serializers.SerializerMethodField()
    instructor = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()

    class Meta:
        model = ClassSession
        fields = ("id", "group_id", "starts_at", "ends_at", "status", "notes", "class_type", "instructor", "location")

    def get_class_type(self, obj):
        ct = obj.group.class_type
        return {"id": str(ct.id), "name": ct.name, "level": ct.level, "duration_minutes": ct.duration_minutes}

    def get_instructor(self, obj):
        inst = obj.substitute_instructor or obj.group.primary_instructor
        if not inst:
            return None
        return {"id": str(inst.id), "first_name": inst.first_name, "last_name": inst.last_name}

    def get_location(self, obj):
        loc = obj.group.location
        return {"pk": str(loc.pk), "name": loc.name}


class ClassSessionAdminWriteSerializer(serializers.Serializer):
    class_type = serializers.IntegerField()
    instructor = serializers.UUIDField()
    location = serializers.IntegerField()
    date = serializers.DateField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        if data["end_time"] <= data["start_time"]:
            raise serializers.ValidationError({
                "end_time": ["Godzina zakończenia musi być po rozpoczęciu."]
            })

        tz = timezone.get_current_timezone()
        starts_at = timezone.make_aware(
            datetime.datetime.combine(data["date"], data["start_time"]),
            tz
        )
        ends_at = timezone.make_aware(
            datetime.datetime.combine(data["date"], data["end_time"]),
            tz
        )

        now = timezone.now()
        if starts_at < now:
            raise serializers.ValidationError({
                "date": ["Nie można dodać zajęć w przeszłości."]
            })

        qs = ClassSession.objects.select_related("group").all()

        session_id = self.context.get("session_id")
        if session_id:
            qs = qs.exclude(pk=session_id)

        overlap = Q(starts_at__lt=ends_at) & Q(ends_at__gt=starts_at)

        if qs.filter(
            overlap,
            group__class_type_id=data["class_type"],
            group__primary_instructor_id=data["instructor"],
            group__location_id=data["location"],
        ).exists():
            raise serializers.ValidationError({
                "date": ["Takie same zajęcia w tym terminie już istnieją."]
            })

        if qs.filter(overlap, group__location_id=data["location"]).exists():
            raise serializers.ValidationError({
                "location": ["Studio jest zajęte w tym terminie."]
            })

        if qs.filter(overlap).filter(
            Q(group__primary_instructor_id=data["instructor"]) |
            Q(substitute_instructor_id=data["instructor"])
        ).exists():
            raise serializers.ValidationError({
                "instructor": ["Instruktor ma już inne zajęcia w tym terminie."]
            })

        return data


class ClassTypeSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    class Meta:
        model = ClassType
        fields = ("id", "name", "level", "description", "duration_minutes", "default_capacity", "is_active")
