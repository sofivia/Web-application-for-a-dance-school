from rest_framework import serializers

from .models import Account, Role


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ("id", "code", "name", "description", "is_active")


class AccountSerializer(serializers.ModelSerializer):
    roles = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field="code",
    )

    class Meta:
        model = Account
        fields = (
            "id",
            "email",
            "is_active",
            "is_staff",
            "auth_provider",
            "external_id",
            "email_verified_at",
            "created_at",
            "updated_at",
            "roles",
        )


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Account
        fields = ("id", "email", "password")
        read_only_fields = ("id",)

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = Account.objects.create_user(
            password=password,
            **validated_data,
        )

        student_role, _ = Role.objects.get_or_create(
            code="student",
            defaults={
                "name": "Student",
                "description": "Default student role",
                "is_active": True,
            },
        )

        user.roles.add(student_role)

        return user
