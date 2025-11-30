import uuid
from django.conf import settings
from django.db import models


class PassProduct(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)

    validity_months = models.PositiveIntegerField()
    price_cents = models.PositiveIntegerField()

    valid_from = models.DateField(null=True, blank=True)
    valid_to = models.DateField(null=True, blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Purchase(models.Model):
    class Method(models.TextChoices):
        CASH = "cash", "Cash"
        TRANSFER = "transfer", "Bank transfer"
        CARD = "card", "Card"

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

    paid_at = models.DateTimeField()
    method = models.CharField(max_length=20, choices=Method.choices)

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
        ordering = ["-paid_at"]

    def __str__(self) -> str:
        return (
            f"{self.student} - {self.product} "
            f"({self.period_start}..{self.period_end})"
        )


class PaymentAllocation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    purchase = models.ForeignKey(
        "billing.Purchase",
        on_delete=models.CASCADE,
        related_name="allocations",
    )

    session = models.ForeignKey(
        "school.ClassSession",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payment_allocations",
    )

    month = models.DateField(
        null=True,
        blank=True,
    )

    amount_cents = models.PositiveIntegerField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["purchase", "month", "session"]

    def __str__(self) -> str:
        return f"{self.purchase} -> {self.amount_cents} cents"
