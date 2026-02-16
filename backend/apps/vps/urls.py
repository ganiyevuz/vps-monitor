from rest_framework.routers import SimpleRouter

from .views import VPSViewSet, InstanceCustomPriceViewSet

router = SimpleRouter(trailing_slash=False)
router.register(r"vps", VPSViewSet, basename="vps")
router.register(r"instance-prices", InstanceCustomPriceViewSet, basename="instance-price")

urlpatterns = router.urls
