from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import OutfitViewSet, HullViewSet, BuildViewSet, getReleases

router = DefaultRouter(trailing_slash=False)
router.register('hulls', HullViewSet, basename='hull')
router.register('outfits', OutfitViewSet, basename='outfit')
router.register('builds', BuildViewSet, basename='build')

urlpatterns = [
  path('releases', getReleases),
]

urlpatterns += router.urls
