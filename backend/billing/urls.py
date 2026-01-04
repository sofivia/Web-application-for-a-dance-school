from rest_framework.routers import DefaultRouter

from .views import PassProductViewSet, PurchaseViewSet

app_name = "billing"

router = DefaultRouter()
router.register("pass-products", PassProductViewSet, basename="passproduct")
router.register("purchases", PurchaseViewSet, basename="purchase")

urlpatterns = router.urls
