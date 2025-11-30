from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Account, Role
from .serializers import AccountSerializer, RoleSerializer, RegisterSerializer


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = AccountSerializer(request.user)
        return Response(serializer.data)


class AccountViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Account.objects.all().prefetch_related("roles")
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAdminUser]


class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAdminUser]


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["email"] = user.email
        token["is_staff"] = user.is_staff
        token["roles"] = [r.code for r in user.roles.all()]

        return token


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class RegisterView(APIView):

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = EmailTokenObtainPairSerializer.get_token(user)
        access = refresh.access_token

        return Response(
            {
                "user": AccountSerializer(user).data,
                "refresh": str(refresh),
                "access": str(access),
            },
            status=201,
        )
