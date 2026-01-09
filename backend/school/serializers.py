from django.contrib.auth import get_user_model
from rest_framework import serializers

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
    class Meta:
        model = Student
        fields = ("first_name", "last_name", "date_of_birth", "phone")


class InstructorInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instructor
        fields = ("first_name", "last_name", "short_bio", "phone")


class AccountViewSerializer(serializers.ModelSerializer):
    pk = serializers.CharField(read_only=True)
    isActive = serializers.BooleanField(source="is_active", read_only=True)

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
            "isActive",
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
            "is_enrolled",
        )
        read_only_fields = fields


class ClassGroupWriteSerializer(serializers.ModelSerializer):
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


class AdminStudentUpdateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    is_active = serializers.BooleanField(required=False)
    first_name = serializers.CharField(required=False, max_length=100)
    last_name = serializers.CharField(required=False, max_length=100)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=50)


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
