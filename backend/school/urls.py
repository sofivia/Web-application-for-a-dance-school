from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    StudentView,
    InstructorView,
    ClassFiltersView,
    ClassSessionListView,
    ClassGroupView,
    EnrollView,
    UnenrollView,
)

app_name = "school"
router = DefaultRouter()
router.register('classgroups', ClassGroupView, basename='classgroup')

urlpatterns = [
    path("students/", StudentView.as_view(), name="students"),
    path("instructors/", InstructorView.as_view(), name="instructors"),
    path("class-filters/", ClassFiltersView.as_view(), name="class_filters"),
    path("classes/", ClassSessionListView.as_view(), name="classes"),
    path("enroll/", EnrollView.as_view(), name="enroll"),
    path("unenroll/", UnenrollView.as_view(), name="unenroll"),
]

urlpatterns += router.urls
