from rest_framework import serializers

from .models import Student, Instructor


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ("id", "account", "first_name",
                  "last_name", "date_of_birth", "phone")
        read_only_fields = ("id", "account")


class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instructor
        fields = ("id", "account", "first_name",
                  "last_name", "short_bio", "phone")
        read_only_fields = ("id", "account")
