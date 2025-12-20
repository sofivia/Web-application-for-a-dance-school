from django.db import IntegrityError
from rest_framework.exceptions import APIException
from rest_framework import status, permissions, generics, mixins
from .serializers import StudentSerializer, InstructorSerializer
from .permissions import IsStudent, IsInstructor
from .models import Student, Instructor
from rest_framework.generics import get_object_or_404


class Conflict(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Resource conflict detected.'
    default_code = 'conflict'


class CreateUpdateRetrieveAPIView(
        mixins.CreateModelMixin,
        generics.RetrieveUpdateAPIView):
    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


class StudentView(CreateUpdateRetrieveAPIView):
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def perform_create(self, serializer):
        try:
            serializer.save()
        except IntegrityError:
            raise Conflict({'account': ['Information already provided '
                                        'for this account.']})

    def get_object(self):
        return get_object_or_404(Student, account=self.request.user)


class InstructorView(CreateUpdateRetrieveAPIView):
    serializer_class = InstructorSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructor]

    def perform_create(self, serializer):
        try:
            serializer.save()
        except IntegrityError:
            raise Conflict({'account': ['Information already provided '
                                        'for this account.']})

    def get_object(self):
        return get_object_or_404(Instructor, account=self.request.user)
