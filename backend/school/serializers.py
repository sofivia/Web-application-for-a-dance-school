from rest_framework import serializers

from .models import Student, Instructor


class StudentSerializer(serializers.ModelSerializer):
    account = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )

    class Meta:
        model = Student
        fields = ("account", "first_name", "last_name",
                  "date_of_birth", "phone")


class InstructorSerializer(serializers.ModelSerializer):
    account = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )

    class Meta:
        model = Instructor
        fields = ("account", "first_name", "last_name", "short_bio", "phone")