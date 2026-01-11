from __future__ import annotations

from datetime import date
from rest_framework import serializers
from .models import PassProduct, Purchase


class PassProductSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    class Meta:
        model = PassProduct
        fields = (
            "id",
            "name",
            "description",
            "price_cents",
            "is_active",
        )


class PurchaseReadSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    student_id = serializers.CharField(source="student.id", read_only=True)
    student_name = serializers.SerializerMethodField()
    product_id = serializers.CharField(source="product.id", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = Purchase
        fields = (
            "id",
            "student_id",
            "student_name",
            "product_id",
            "product_name",
            "amount_cents",
            "status",
            "paid_at",
            "method",
            "period_start",
            "period_end",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


class PurchaseWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Purchase
        fields = (
            "student",
            "product",
            "amount_cents",
            "status",
            "paid_at",
            "method",
            "period_start",
            "period_end",
        )

    def validate(self, attrs):
        ps = attrs.get("period_start")
        pe = attrs.get("period_end")
        if ps and pe and pe < ps:
            raise serializers.ValidationError({"period_end": ["Must be >= period_start."]})
        return attrs


class PurchaseMarkPaidSerializer(serializers.Serializer):
    method = serializers.ChoiceField(choices=Purchase.Method.choices)
    paid_at = serializers.DateTimeField(required=False, allow_null=True)


class GenerateMonthlyPurchasesSerializer(serializers.Serializer):
    month = serializers.DateField()

    def validate_month(self, value: date):
        if value.day != 1:
            raise serializers.ValidationError("month must be the first day of the month (YYYY-MM-01)")
        return value
