from django.db import IntegrityError
from rest_framework.exceptions import APIException
from rest_framework import status, permissions, generics, mixins
from .serializers import StudentSerializer, InstructorSerializer
from .permissions import IsStudent, IsInstructor


class Conflict(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Resource conflict detected.'
    default_code = 'conflict'


class StudentView(
        mixins.CreateModelMixin,
        mixins.RetrieveModelMixin,
        generics.GenericAPIView):
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def perform_create(self, serializer):
        try:
            serializer.save(account=self.request.user)
        except IntegrityError:
            raise Conflict({'account': ['Information already provided '
                                        'for this account.']})

    def get_object(self):
        return self.request.user.student

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


class InstructorView(
        mixins.CreateModelMixin,
        mixins.RetrieveModelMixin,
        generics.GenericAPIView):
    serializer_class = InstructorSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructor]

    def perform_create(self, serializer):
        try:
            serializer.save(account=self.request.user)
        except IntegrityError:
            raise Conflict({'account': ['Information already provided '
                                        'for this account.']})

    def get_object(self):
        return self.request.user.instructor

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)
