from django.contrib import admin
from .models import (
    Student,
    Instructor,
    ClassType,
    ClassGroup,
    ClassSession,
    Enrollment,
    WaitlistEntry,
    AttendanceRecord,
    GroupMessage
)


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "account", "is_active")
    search_fields = ("first_name", "last_name", "account__email")
    list_filter = ("is_active",)


@admin.register(Instructor)
class InstructorAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "account", "is_active")
    search_fields = ("first_name", "last_name", "account__email")
    list_filter = ("is_active",)


@admin.register(ClassType)
class ClassTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "level", "duration_minutes", "default_capacity", "is_active")
    list_filter = ("is_active", "level")
    search_fields = ("name",)


@admin.register(ClassGroup)
class ClassGroupAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "class_type",
        "primary_instructor",
        "weekday",
        "start_time",
        "location",
        "is_active",
    )
    list_filter = ("weekday", "is_active", "class_type")
    search_fields = ("name", "location")


@admin.register(ClassSession)
class ClassSessionAdmin(admin.ModelAdmin):
    list_display = ("group", "starts_at", "status", "substitute_instructor")
    list_filter = ("status", "group")
    search_fields = ("group__name",)


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("student", "group", "status", "enrolled_at")
    list_filter = ("status", "group")
    search_fields = ("student__first_name", "student__last_name")


@admin.register(WaitlistEntry)
class WaitlistEntryAdmin(admin.ModelAdmin):
    list_display = ("student", "group", "status", "position", "created_at")
    list_filter = ("status", "group")


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ("session", "student", "status", "marked_by", "marked_at")
    list_filter = ("status", "session__group")
    search_fields = ("student__first_name", "student__last_name")


@admin.register(GroupMessage)
class GroupMessageAdmin(admin.ModelAdmin):
    list_display = ("subject", "group", "sent_by", "sent_at")
    list_filter = ("group",)
    search_fields = ("subject", "body")