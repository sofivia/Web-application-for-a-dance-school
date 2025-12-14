from rest_framework import serializers

from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ("id", "account", "first_name",
                  "last_name", "date_of_birth", "phone")
        read_only_fields = ("id", "account")
