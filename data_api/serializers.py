import copy
import re
from rest_framework import serializers

from .models import Hull, Outfit, Build, Outfit_details


class NonEmptySerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        non_null_ret = copy.deepcopy(ret)
        for key in ret.keys():
            if not ret[key] and key != 'spoiler':
                non_null_ret.pop(key)
            elif isinstance(ret[key], str) and re.fullmatch('[0.]+', ret[key]):
                non_null_ret.pop(key)
        return non_null_ret

class HullSerializer(NonEmptySerializer):
  class Meta:
    model = Hull
    fields = '__all__'

class OutfitSerializer(NonEmptySerializer):
  class Meta:
    model = Outfit
    fields = '__all__'

class OutfitDetailsSerializer(serializers.ModelSerializer):
  class Meta:
    model = Outfit_details
    fields = ['outfit', 'amount']

class BuildSerializer(serializers.ModelSerializer):
  outfits = OutfitDetailsSerializer(read_only=True, many=True, source='outfit_details')

  class Meta:
    model = Build
    fields = ['id', 'hull', 'name', 'outfits']
