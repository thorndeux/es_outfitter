import logging

from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.response import Response

from .models import Hull, Outfit, Build
from .serializers import HullSerializer, OutfitSerializer, BuildSerializer


logger = logging.getLogger(__name__)

# Hull views
class HullViewSet(viewsets.ViewSet):
  def list(self, request):
    params = request.query_params
    queryset = Hull.objects.all()

    # Adjust viewset based on query parameters
    if params:
      logger.debug(f"Query params are {params}")
      release = params.get('release')
      spoiler = params.get('spoiler')
      faction = params.get('faction')
      category = params.get('category')
      if release:
        queryset = queryset.filter(release=release)
      if spoiler:
        queryset = queryset.filter(spoiler__lte=int(spoiler))
      if faction:
        queryset = queryset.filter(faction=faction)
      if category:
        queryset = queryset.filter(category=category)
    serializer = HullSerializer(queryset, many=True)
    return Response(serializer.data)

  def retrieve(self, request, pk=None):
    queryset = Hull.objects.all()
    hull = get_object_or_404(queryset, pk=pk)
    serializer = HullSerializer(hull)
    return Response(serializer.data)


# Outfit views
class OutfitViewSet(viewsets.ViewSet):
  def list(self, request):
    params = request.query_params
    queryset = Outfit.objects.all()

    # Adjust viewset based on query parameters
    if params:
      logger.debug(f"Query params are {params}")
      release = params.get('release')
      spoiler = params.get('spoiler')
      faction = params.get('faction')
      category = params.get('category')
      if release:
        queryset = queryset.filter(release=release)
      if spoiler:
        queryset = queryset.filter(spoiler__lte=int(spoiler))
      if faction:
        queryset = queryset.filter(faction=faction)
      if category:
        queryset = queryset.filter(category=category)
    serializer = OutfitSerializer(queryset, many=True)
    return Response(serializer.data)

  def retrieve(self, request, pk=None):
    queryset = Outfit.objects.all()
    outfit = get_object_or_404(queryset, pk=pk)
    serializer = OutfitSerializer(outfit)
    return Response(serializer.data)


# Build views
class BuildViewSet(viewsets.ViewSet):
  def list(self, request):
    params = request.query_params
    queryset = Build.objects.all()

    # Adjust viewset based on query parameter
    if params:
      logger.debug(f"Query params are {params}")
      release = params.get('release')
      if release:
        queryset = queryset.filter(hull__release=release)
    serializer = BuildSerializer(queryset, many=True)
    return Response(serializer.data)

  def retrieve(self, request, pk=None):
    queryset = Build.objects.all()
    build = get_object_or_404(queryset, pk=pk)
    serializer = BuildSerializer(build)
    return Response(serializer.data)


# Returns array of release options for the react-select module
def getReleases(request):
  releases = Hull.objects.all().values_list('release', flat=True).distinct().order_by('-release')
  release_options = { "Releases": [{"value": release, "label": release.capitalize()} for release in releases]}    
  return JsonResponse(release_options)
