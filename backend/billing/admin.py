from django.contrib import admin
from .models import PassProduct, Purchase


@admin.register(PassProduct)
class PassProductAdmin(admin.ModelAdmin):
    list_display = ("name", "price_cents", "validity_months", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "product",
        "amount_cents",
        "paid_at",
        "method",
        "period_start",
        "period_end",
    )
    list_filter = ("method", "product")
    search_fields = ("student__first_name", "student__last_name")
