from django.urls import path
from .views import StudentView, InstructorView


urlpatterns = [
    path("students/", StudentView.as_view(), name="students"),
    path("instructors/", InstructorView.as_view(), name="instructors"),
]
