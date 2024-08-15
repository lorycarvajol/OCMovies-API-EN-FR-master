"""OCMovies-API URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/genres/", include("api.v1.genres.urls")),
    path("api/v1/titles/", include("api.v1.titles.urls")),
    path("", TemplateView.as_view(template_name="index.html")),
]
