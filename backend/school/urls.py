from django.urls import path

from .views import (
    StudentView,
    InstructorView,
    ClassFiltersView,
    ClassSessionListView,
    EnrollView,
    UnenrollView,
)

app_name = "school"
urlpatterns = [
    path("students/", StudentView.as_view(), name="students"),
    path("instructors/", InstructorView.as_view(), name="instructors"),
    path("class-filters/", ClassFiltersView.as_view(), name="class_filters"),
    path("classes/", ClassSessionListView.as_view(), name="classes"),
    path("enroll/", EnrollView.as_view(), name="enroll"),
    path("unenroll/", UnenrollView.as_view(), name="unenroll"),
]
