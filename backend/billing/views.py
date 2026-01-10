from __future__ import annotations

from datetime import date

from django.db import transaction
from django.utils import timezone

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.response import Response

from school.permissions import IsAdmin, IsAdminOrStudentReadOnly

from .models import PassProduct, Purchase
from .serializers import (
    PassProductSerializer,
    PurchaseReadSerializer,
    PurchaseWriteSerializer,
    PurchaseMarkPaidSerializer,
    GenerateMonthlyPurchasesSerializer,
)
from .services import generate_monthly_purchases

from common import utils


class PassProductViewSet(viewsets.ModelViewSet):

    permission_classes = [IsAdminOrStudentReadOnly]
    serializer_class = PassProductSerializer
    pagination_class = utils.StandardPagination
    queryset = PassProduct.objects.all()

    def get_queryset(self):
        if IsAdmin().has_permission(self.request, self):
            return PassProduct.objects.all()
        return PassProduct.objects.filter(is_active=True)


class PurchaseViewSet(viewsets.ModelViewSet):

    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Purchase.objects.select_related("student", "product")
        if IsAdmin().has_permission(self.request, self):
            return qs
        student = getattr(self.request.user, "student", None)
        if not student:
            return Purchase.objects.none()
        return qs.filter(student=student)

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return PurchaseWriteSerializer
        return PurchaseReadSerializer

    def _require_admin(self):
        if not IsAdmin().has_permission(self.request, self):
            raise PermissionDenied("Admin access required.")

    def perform_create(self, serializer):
        self._require_admin()
        serializer.save(recorded_by=self.request.user)

    @action(detail=True, methods=["post"], url_path="mark-paid")
    def mark_paid(self, request, pk=None):
        self._require_admin()
        purchase: Purchase = self.get_object()
        s = PurchaseMarkPaidSerializer(data=request.data)
        s.is_valid(raise_exception=True)

        if purchase.status == Purchase.Status.PAID:
            return Response({"ok": True, "status": purchase.status})

        purchase.status = Purchase.Status.PAID
        purchase.paid_at = s.validated_data.get("paid_at") or timezone.now()
        purchase.method = s.validated_data["method"]
        purchase.recorded_by = request.user
        purchase.save(update_fields=["status", "paid_at", "method", "recorded_by", "updated_at"])

        return Response({"ok": True, "status": purchase.status})

    @action(detail=True, methods=["post"], url_path="void")
    def void(self, request, pk=None):
        self._require_admin()
        purchase: Purchase = self.get_object()
        if purchase.status == Purchase.Status.PAID:
            raise ValidationError({"status": ["Cannot void a paid purchase."]})
        purchase.status = Purchase.Status.VOID
        purchase.save(update_fields=["status", "updated_at"])
        return Response({"ok": True, "status": purchase.status})

    @action(detail=False, methods=["post"], url_path="generate-monthly")
    def generate_monthly(self, request):
        self._require_admin()
        s = GenerateMonthlyPurchasesSerializer(data=request.data)
        s.is_valid(raise_exception=True)

        month: date = s.validated_data["month"]
        with transaction.atomic():
            created, skipped = generate_monthly_purchases(month_start=month, recorded_by=request.user)

        return Response({"created": created, "skipped": skipped}, status=status.HTTP_200_OK)
