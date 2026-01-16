from __future__ import annotations

from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.db import transaction

from school.models import Student
from .models import Purchase

User = get_user_model()


def month_bounds(month_start: date) -> tuple[date, date]:
    if month_start.day != 1:
        raise ValueError("month_start must be the first day of month")
    if month_start.month == 12:
        next_month = date(month_start.year + 1, 1, 1)
    else:
        next_month = date(month_start.year, month_start.month + 1, 1)
    return month_start, next_month - timedelta(days=1)


@transaction.atomic
def generate_monthly_purchases(month_start: date, recorded_by: User | None = None) -> tuple[int, int]:
    start, end = month_bounds(month_start)

    qs = Student.objects \
        .exclude(pass_product_id=None) \
        .exclude(purchases__period_start=start) \
        .distinct() \
        .select_related("pass_product")
    students = list(qs)

    for student in students:
        product = student.pass_product

        Purchase.objects.create(
            student=student,
            product=product,
            amount_cents=product.price_cents,
            status=Purchase.Status.PENDING,
            period_start=start,
            period_end=end,
            recorded_by=recorded_by,
        )

    return len(students), Student.objects.count() - len(students)
