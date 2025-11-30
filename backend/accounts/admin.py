from django.contrib import admin
from .models import Account, Role, EmailVerification, DeletionRequest


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ("email", "is_active", "is_staff", "created_at")
    search_fields = ("email",)
    list_filter = ("is_active", "is_staff")


admin.site.register(Role)
admin.site.register(EmailVerification)
admin.site.register(DeletionRequest)
