from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    StudentView,
    InstructorView,
    StudentAdminDetailView,
    InstructorAdminDetailView,
    ClassFiltersView,
    ClassSessionListView,
    ClassGroupView,
    EnrollView,
    UnenrollView,
    AccountViewSet,
    StudentAttendanceListView,
    ClassSessionParticipantsView,
    AdminClassSessionViewSet
)

app_name = "school"
router = DefaultRouter()
router.register('classgroups', ClassGroupView, basename='classgroup')
router.register('accounts', AccountViewSet, basename='account')
router.register("admin-sessions", AdminClassSessionViewSet, basename="admin-sessions")

urlpatterns = [
    path("students/", StudentView.as_view(), name="students"),
    path("students/<str:pk>/", StudentAdminDetailView.as_view(), name="student_detail"),
    path("instructors/", InstructorView.as_view(), name="instructors"),
    path("instructors/<str:pk>/", InstructorAdminDetailView.as_view(), name="instructor_detail"),
    path("class-filters/", ClassFiltersView.as_view(), name="class_filters"),
    path("classes/", ClassSessionListView.as_view(), name="classes"),
    path("enroll/", EnrollView.as_view(), name="enroll"),
    path("unenroll/", UnenrollView.as_view(), name="unenroll"),
    path("attendance/", StudentAttendanceListView.as_view(), name="attendance"),
    path("classes/<str:session_id>/participants/", ClassSessionParticipantsView.as_view(),
         name="class_session_participants"),
]

urlpatterns += router.urls
