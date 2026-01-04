from __future__ import annotations

from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.db import transaction

from school.models import Enrollment, Student
from .models import PassProduct, Purchase

User = get_user_model()


def month_bounds(month_start: date) -> tuple[date, date]:
    if month_start.day != 1:
        raise ValueError("month_start must be the first day of month")
    if month_start.month == 12:
        next_month = date(month_start.year + 1, 1, 1)
    else:
        next_month = date(month_start.year, month_start.month + 1, 1)
    return month_start, next_month - timedelta(days=1)


def ensure_student_has_pass_product(student: Student) -> PassProduct | None:
    if getattr(student, "pass_product_id", None):
        return student.pass_product

    product = (
        PassProduct.objects
        .filter(is_active=True)
        .order_by("price_cents", "name")
        .first()
    )
    if not product:
        return None

    student.pass_product = product
    student.save(update_fields=["pass_product", "updated_at"])
    return product


@transaction.atomic
def generate_monthly_purchases(month_start: date, recorded_by: User | None = None) -> tuple[int, int]:
    start, end = month_bounds(month_start)

    students = (
        Student.objects
        .filter(is_active=True, enrollments__status=Enrollment.Status.ACTIVE)
        .distinct()
        .select_related("pass_product")
    )

    created = 0
    skipped = 0

    for student in students:
        product = ensure_student_has_pass_product(student) or student.pass_product
        if not product:
            skipped += 1
            continue

        exists = Purchase.objects.filter(student=student, period_start=start).exists()
        if exists:
            skipped += 1
            continue

        Purchase.objects.create(
            student=student,
            product=product,
            amount_cents=product.price_cents,
            status=Purchase.Status.PENDING,
            period_start=start,
            period_end=end,
            recorded_by=recorded_by,
        )
        created += 1

    return created, skipped
