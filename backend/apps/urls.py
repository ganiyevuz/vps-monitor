from django.urls import path, include

urlpatterns = [
    path("", include("providers.urls")),
    path("", include("vps.urls")),
]
