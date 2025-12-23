from rest_framework import permissions


class HasRole(permissions.BasePermission):
    def _has_role(self, user):
        return self.role in [r.code for r in user.roles.all()]

    def has_permission(self, request, view):
        return permissions.IsAuthenticated().has_permission(request, view) \
            and self._has_role(request.user)


class HasStudentRole(HasRole):
    role = "student"


class HasInstructorRole(HasRole):
    role = "instructor"


class IsAdmin(HasRole):
    role = "admin"


class IsStudent:
    def has_permission(self, request, view):
        return permissions.IsAuthenticated().has_permission(request, view) \
            and getattr(request.user, 'student', None) is not None


class IsInstructor:
    def has_permission(self, request, view):
        return permissions.IsAuthenticated().has_permission(request, view) \
            and getattr(request.user, 'instructor', None) is not None


class IsAdminOrStudentReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if IsAdmin().has_permission(request, view):
            return True
        return request.method in permissions.SAFE_METHODS \
            and IsStudent().has_permission(request, view)
