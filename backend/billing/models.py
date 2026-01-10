import uuid
from django.conf import settings
from django.db import models


class PassProduct(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)

    price_cents = models.PositiveIntegerField()

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_active", "created_at", "name"]

    def __str__(self) -> str:
        return self.name


class Purchase(models.Model):
    class Method(models.TextChoices):
        CASH = "cash", "Cash"
        TRANSFER = "transfer", "Bank transfer"
        CARD = "card", "Card"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        VOID = "void", "Void"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    student = models.ForeignKey(
        "school.Student",
        on_delete=models.PROTECT,
        related_name="purchases",
    )
    product = models.ForeignKey(
        "billing.PassProduct",
        on_delete=models.PROTECT,
        related_name="purchases",
    )

    amount_cents = models.PositiveIntegerField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    paid_at = models.DateTimeField(null=True, blank=True)
    method = models.CharField(max_length=20, choices=Method.choices, null=True, blank=True)

    period_start = models.DateField()
    period_end = models.DateField()

    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recorded_purchases",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-period_start", "-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["student", "period_start"], name="uniq_purchase_student_month"),
        ]

    def __str__(self) -> str:
        return (
            f"{self.student} - {self.product} "
            f"({self.period_start}..{self.period_end}) [{self.status}]"
        )
