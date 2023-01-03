import django
import subprocess

from django.conf import settings
from django.core.management import call_command
from pathlib import Path

stable_releases = ['0.9.14', '0.9.15', '0.9.16']

fixture = 'data_api/raw_data/stable_releases_fixture'
db = 'db/db.sqlite3'

def build_db(releases: list[str]) -> None:
  for release in releases:
    data.get_release(release)
    data.parse_raw(release)

def save_fixture() -> None:
  call_command('dumpdata', '--exclude=auth', output=fixture)

def has_continous_changed() -> bool:
  # TODO
  return False

if __name__=="__main__":
  # Start Django and set up database
  django.setup()
  call_command('migrate', verbosity=0)

  # Import data handling functions
  from data_api import data
  
  # Import model and check for any releases present in the database
  from data_api.models import Hull
  db_releases = Hull.objects.all().values_list('release', flat=True).distinct()
  missing_releases = [r for r in stable_releases if r not in db_releases]
  
  # If a release is missing or if there is no fixture, rebuild database
  if not Path(settings.BASE_DIR / fixture).exists() or missing_releases:
    call_command('flush', verbosity=0, interactive=False)
    build_db(stable_releases)
    save_fixture()
    data.get_release('continuous')
    data.parse_raw('continuous')
  # If database is in order, check if continuous has changed
  else:
    if (has_continous_changed()):
    # if yes:
      # flush db
      call_command('flush', verbosity=0, interactive=False)
      # load fixture
      call_command('loaddata', fixture, verbosity=0)
      # get and parse continuous
      data.get_release('continuous')
      data.parse_raw('continuous')

  call_command('collectstatic', verbosity=0, interactive=False)
  subprocess.call(['gunicorn', 'es_outfitter.wsgi', '--bind=0.0.0.0:443'])