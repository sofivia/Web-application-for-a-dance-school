from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import MeView, AccountViewSet, RoleViewSet 
from .views import EmailTokenObtainPairView, RegisterView


router = DefaultRouter()
router.register("users", AccountViewSet, basename="account")
router.register("roles", RoleViewSet, basename="role")

urlpatterns = [
    path("token/", EmailTokenObtainPairView.as_view(), 
         name="accounts_token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), 
         name="accounts_token_refresh"),
    path("register/", RegisterView.as_view(), name="accounts_register"),
    path("me/", MeView.as_view(), name="accounts_me"),
]

urlpatterns += router.urls
