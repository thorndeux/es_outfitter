import decimal
import logging

from django.conf import settings
from django.test import TestCase
from pathlib import Path

from .data import get_release, parse_hull_variant, parse_raw, parse_outfits, create_outfit, parse_ships
from .models import Hull, Outfit, Build, Outfit_details

logger = logging.getLogger(__name__)

release = '0.9.14'

class ParseOutfitsTest(TestCase):
  @classmethod
  def setUpTestData(cls):
    
    # Run parse_raw
    parse_raw(release)

    # To test specific files:
    # folder = "wanderer"
    # outfit_file = "wanderer outfits.txt"
    # hull_file = "wanderer ships.txt"

    # outfit_path = Path(settings.BASE_DIR / 'data_api' / 'raw_data' / release / folder / outfit_file)
    # hull_path = Path(settings.BASE_DIR / 'data_api' / 'raw_data' / release / folder / hull_file)

    # parse_outfits(outfit_path, release)
    # logger.info(f'# of outfits: {Outfit.objects.all().count()}')
    

    # Display all values of each outfit    
    for outfit in Outfit.objects.all().values():
      for value in outfit:
        if outfit[value] and outfit[value] != 0:
          logger.debug(f'{value}: {outfit[value]}')
      logger.debug("---------------------END OUTFIT---------------------")

    # Parse hulls
    # parse_ships(hull_path, release)
    # logger.info(f'# of hulls: {Hull.objects.all().count()}')
    
    # Display all values of each hull
    for hull in Hull.objects.all().values():
      for value in hull:
        if hull[value] and hull[value] != 0:
          logger.debug(f'{value}: {hull[value]}')
      logger.debug("---------------------END HULL-----------------------")
      
    # Display details for each build
    for build in Build.objects.all():
      logger.debug(f"Build ID: {build.id}")
      logger.debug(f"Build name: {build.name}")
      logger.debug(f"Hull: {build.hull}")
      logger.debug(f"Outfits:")
      for outfit in Outfit_details.objects.filter(build=build):
        logger.debug(f"\t{outfit.outfit}: {outfit.amount}")
      logger.debug("---------------------END BUILD----------------------")

  def test_there_are_outfits(self):
    self.assertTrue(Outfit.objects.all().count() > 0)

  def test_sprite_import(self):
    penguin_sprite = Hull.objects.get(name="Penguin").sprite
    self.assertTrue(penguin_sprite == release + "/ship/penguin/penguin-00.png")

  def test_flamethrower_damage(self):
    flamethrower = Outfit.objects.get(name="Flamethrower")
    self.assertEqual(flamethrower.shield_damage, decimal.Decimal('0.8'))
    self.assertEqual(flamethrower.shield_dps, decimal.Decimal('48'))
    self.assertEqual(flamethrower.hull_damage, decimal.Decimal('0.7'))
    self.assertEqual(flamethrower.hull_dps, decimal.Decimal('42'))
    self.assertEqual(flamethrower.heat_damage, decimal.Decimal('200'))
    self.assertEqual(flamethrower.heat_dps, decimal.Decimal('12000'))

  def test_bullfrog_aggregates(self):
    bullfrog = Outfit.objects.get(name="Bullfrog Anti-Missile")
    self.assertEqual(bullfrog.shots_per_second, decimal.Decimal('3'))
    self.assertEqual(bullfrog.anti_missile_dps, decimal.Decimal('36'))
