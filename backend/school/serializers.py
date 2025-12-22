from rest_framework import serializers

from .models import Student, Instructor, ClassType, ClassSession, ClassGroup


class StudentSerializer(serializers.ModelSerializer):
    account = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )

    class Meta:
        model = Student
        fields = ("id", "account", "first_name", "last_name",
                  "date_of_birth", "phone")
        read_only_fields = ("id",)


class InstructorSerializer(serializers.ModelSerializer):
    account = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )

    class Meta:
        model = Instructor
        fields = ("id", "account", "first_name", "last_name", "short_bio",
                  "phone")
        read_only_fields = ("id",)


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

    class_type = ClassTypeMiniSerializer(source="group.class_type",
                                         read_only=True)

    instructor = serializers.SerializerMethodField()
    studio = serializers.SerializerMethodField()

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
            "studio",
            "limit",
            "enrolled",
            "is_enrolled",
        )

    def get_instructor(self, obj):
        inst = obj.substitute_instructor or obj.group.primary_instructor
        if not inst:
            return None
        return InstructorMiniSerializer(inst).data

    def get_studio(self, obj):
        return str(obj.group.location) or None

    def get_limit(self, obj):
        if obj.group.capacity is not None:
            return obj.group.capacity
        return obj.group.class_type.default_capacity


class ClassGroupReadSerializer(serializers.ModelSerializer):
    primary_instructor = serializers.StringRelatedField()
    location = serializers.StringRelatedField()

    class Meta:
        model = ClassGroup
        fields = ("pk", "name", "primary_instructor", "weekday",
                  "start_time", "end_time", "location", "capacity",
                  "start_date", "end_date")
        read_only_fields = fields


class ClassGroupWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassGroup
        fields = ("name", "class_type", "primary_instructor", "weekday",
                  "start_time", "end_time", "location", "capacity",
                  "start_date", "end_date", "is_active")
