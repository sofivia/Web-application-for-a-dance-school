from rest_framework import permissions


class IsStudent(permissions.BasePermission):
    def _has_student_role(self, user):
        return "student" in [r.code for r in user.roles.all()]

    def has_permission(self, request, view):
        return request.user and self._has_student_role(request.user)


class IsInstructor(permissions.BasePermission):
    def _has_student_role(self, user):
        return "instructor" in [r.code for r in user.roles]

    def has_permission(self, request, view):
        return request.user and self._has_student_role(request.user)
