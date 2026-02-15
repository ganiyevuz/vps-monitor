from django.urls import path

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

# Add `never_cache` to prevent caching of the schema view
urlpatterns = [
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("redoc", SpectacularRedocView.as_view(), name="redoc"),
    path("", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
