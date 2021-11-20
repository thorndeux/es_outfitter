import logging

from django.conf import settings
from django.test import TestCase
from pathlib import Path

from .data import get_release, parse_hull_variant, parse_raw, parse_outfits, create_outfit, parse_ships
from .models import Hull, Outfit, Build, Outfit_details

logger = logging.getLogger(__name__)

release = 'continuous'

class ParseOutfitsTest(TestCase):
  @classmethod
  def setUpTestData(cls):
    # folder = "wanderer"
    # outfit_file = "wanderer outfits.txt"
    # hull_file = "wanderer ships.txt"

    # outfit_path = Path(settings.BASE_DIR / 'data_api' / 'raw_data' / release / folder / outfit_file)
    # hull_path = Path(settings.BASE_DIR / 'data_api' / 'raw_data' / release / folder / hull_file)

    # parse_outfits(outfit_path, release)
    # logger.info(f'# of outfits: {Outfit.objects.all().count()}')
    
    parse_raw(release)

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

  # def test_outfit_number(self):
  #   self.assertTrue(Outfit.objects.all().count() == 21)

  # def test_oufit_values_1(self):
  #   tracker_pod = Outfit.objects.get(name="Hai Tracker Pod")
  #   self.assertEqual(tracker_pod.release, "0.9.12")
  #   self.assertEqual(tracker_pod.spoiler, 0)
  #   self.assertEqual(tracker_pod.plural, "")
  #   self.assertEqual(tracker_pod.faction, "Hai")
  #   self.assertEqual(tracker_pod.description, "Trackers are fast and accurate homing weapons. Although not as powerful as most human missiles, Trackers boast a significant hit force, helping to prevent the escape of whoever is unfortunate enough to be on the receiving end. Their only weakness is their large turning radius: if a Tracker misses its target, it takes a long time to turn around.")
  #   self.assertEqual(tracker_pod.category, "Secondary Weapons")
  #   self.assertEqual(tracker_pod.license, "")
  #   self.assertEqual(tracker_pod.outfit_space, -19)
