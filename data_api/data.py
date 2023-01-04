"""
Contains functions to download and process (i.e. populate
the relevant models) the raw data of the different 
Endless Sky releases

The hierarchy of functions is:
get_release()
parse_raw()
    parse_outfits()
        create_outfit()
    parse_ships()
        parse_full_ship()
            parse_build()
        parse_hull_variant()
            if necessary: parse_build()
        parse_outfit_variant()
            parse_build()
"""
import decimal
import logging
import re
import requests
import shutil

from django.conf import settings
from pathlib import Path

from .models import Hull, Outfit, Build

logger = logging.getLogger(__name__)

def get_release(release: str):
    """
    Downloads the specified release, unzips it, copies ship/outfit text files 
    and images to appropriate locations, and removes unnecessary files

    Args:
        release (str): Release name (e.g. '0.9.12' or 'continuous')
    """

    # Path of directory for raw data
    raw = settings.BASE_DIR / 'data_api' / 'raw_data'

    # Path of static files for images
    static = settings.BASE_DIR / 'data_api' / 'static' / 'data_api'

    # Make sure release is not already available
    if (raw / release).is_dir() and release != 'continuous':
        logger.info(f'Release {release} is already available')
        return

    # Github .zip files have a 'v' before the release number
    if release[0].isdigit():
        version = 'v' + release
    else:
        version = release

    # URL of source file
    url = 'https://github.com/endless-sky/endless-sky/archive/' + version + '.zip'

    # Make GET request to URL
    # TODO error check!
    # TODO add progress bar with tqdm
    logger.info(f'Downloading data for release {release}')
    request = requests.get(url)

    # Save URL content to file
    logger.info(f'Saving file {release}.zip')
    (raw / (release + '.zip')).write_bytes(request.content)

    logger.info(f'Unzipping file')
    # Unzip to '/raw_data' directory
    shutil.unpack_archive(raw / (release + '.zip'), raw)

    # Create directories for outfit data and images
    try:
        (raw / release).mkdir()
        logger.info(f'Created data directory {str(raw / release)}')
    except FileExistsError:
        logger.info(f'Data directory for {release} already exists.')

    try:
        (static / release).mkdir()
        logger.info(f'Created static directory {str(static / release)}')
    except FileExistsError:
        logger.info(f'Static directory for {release} already exists.')

    # Copy relevant files to data directory
    # Relevant files include these substrings
    substrings = ['engines', 'kestrel', 'marauders', 'nanobots', 'outfits', 'power', 'pug', 'ships', 'variants', 'weapons']

    data = (raw / ('endless-sky-' + release) / 'data')

    for item in data.rglob('*.txt'):
        if any([substring in item.stem for substring in substrings]) and not 'deprecated' in item.stem:
            try:
                shutil.copy(item, (raw / release / item.relative_to(data)))
                logger.info(f"Copied data file '{item.name}'")
            except FileNotFoundError:
                (raw / release / item.parent.relative_to(data)).mkdir()
                shutil.copy(item, (raw / release / item.relative_to(data)))
                logger.info(f"Copied data file '{item.name}'")

    # Copy relevant image folders to static files
    images = (raw / ('endless-sky-' + release) / 'images')

    for item in images.iterdir():
        if item.name in ['hardpoint', 'outfit', 'ship', 'thumbnail']:
            
            # TODO
            # instead: loop over folders
            # for each image:
            # check whether an image with the same name and checksum already exists
            # if no, copy it
            # if yes, make symlink to it instead of copying

            shutil.copytree(item, (static / release / item.name), dirs_exist_ok=True)
            logger.info(f"Copied image folder '{item.name}'")

    # Delete zip file
    (raw / (release + '.zip')).unlink()
    logger.info("Deleted .zip file")

    # Delete unzipped data
    shutil.rmtree(raw / ('endless-sky-' + release))
    logger.info("Deleted unnecessary raw data")


def parse_raw(release: str):
    """
    Parses the raw data of a given release,
    populating the Outfit, Hull, and Build models.
    
    Outfits are created first, as they are
    referenced in Builds.

    Args:
        release (str): Name of the release (e.g. '0.9.12' or 'continuous')
    """
    # Path of release raw data
    raw = Path(settings.BASE_DIR / 'data_api' / 'raw_data' / release)

    if not raw.exists():
        logger.error(f"No raw data available for release {release}.")
        return
    else:
        logger.info(f"Parsing release '{release}'")

    # Outfit files are those text files that contain any of the given substrings
    outfit_files = [file for file in raw.rglob('*.txt') \
                    if any(substring in file.stem for substring in \
                    ['engines', 'outfits', 'nanobots', 'power', 'pug', 'weapons'])]
 
    # Ship files are those text files that contain any of the given substrings
    ship_files = [file for file in raw.rglob('*.txt') \
                  if any(substring in file.stem for substring in \
                  ['kestrel', 'marauders', 'nanotbots', 'pug', 'ships'])]

    # Parse outfit files
    for file in outfit_files:
        logger.info(f"Parsing outfit file '{file.name}'")
        parse_outfits(file, release)

    # Parse ship files
    for file in ship_files:
        logger.info(f"Parsing ship file '{file.name}'")
        parse_ships(file, release)


def parse_outfits(filename: Path, release: str):
    """
    Parses a given file, searching for outfits and 
    creating an Outfit model instance for each result.

    Parses ammos and submunitions first, as these are
    referenced in other outfits (launchers and storage racks).

    Args:
        filename (Path): Path to the source file to be parsed
        release (String): Name of the release (e.g. '0.9.12' or 'continuous')
    """
    # Regex patterns
    # Ammo: category "Ammunition", but no ammo attribute
    ammo_pattern =  re.compile('^outfit "[^"]*"\n(?:\tplural "[^"]*"\n)?\tcategory "Ammunition".*?(?=(?:^ship|^outfit|^effect|^fleet|^mission|\Z))', re.M|re.S)
    
    # Submunition: 'weapon' in second line
    submunition_pattern = re.compile('^outfit "[^"]*"\n\tweapon.*?(?=(?:^ship|^outfit|^effect|^fleet|^mission|\Z))', re.M|re.S)
    
    # Outfits
    outfit_pattern = re.compile('^outfit.*?(?=(?:^ship|^outfit|^effect|^fleet|^mission|\Z))', re.M|re.S)

    with open(filename) as file:
        
        logger.info("Opened '" + str(filename) + "'")

        file_content = file.read()

        outfit_counter = 0
        
        # Loop through ammos
        logger.info("Parse " + str(len(re.findall(ammo_pattern, file_content))) + " ammos:")

        for ammo_string in re.findall(ammo_pattern, file_content):
            
            # Skip storage units (contain 'ammo' attribute)
            if re.search('\tammo ', ammo_string):
                logger.info("Skipped storage unit.")
                continue
            
            create_outfit(filename, ammo_string, release)
            outfit_counter += 1

        # Loop through submunitions
        logger.info("Parse " + str(len(re.findall(submunition_pattern, file_content))) + " submunitions:")
        for submunition_string in re.findall(submunition_pattern, file_content):
            create_outfit(filename, submunition_string, release)
            outfit_counter += 1

        # Loop through all remaining outfits
        logger.info("Parse " + str(len(re.findall(outfit_pattern, file_content))) + " outfits:")
        for outfit_string in re.findall(outfit_pattern, file_content):
            
            # Skip ammo (but not storage units)
            if re.search(ammo_pattern, outfit_string) and not re.search('\tammo ', outfit_string):
                logger.info("Skipped ammo")
                continue
            
            # Skip submunitions
            if re.search(submunition_pattern, outfit_string):
                logger.info("Skipped submunition")
                continue
            
            create_outfit(filename, outfit_string, release)
            outfit_counter += 1

        logger.info(f"Created {outfit_counter} outfits in total.")


def create_outfit(filename: Path, outfit_string: str, release: str):
    """
    Turns an 'outfit_string' into a Outfit model instance

    Args:
        filename (Path): Path to the filename containing the outfit (to get the faction)
        outfit_string (str): String containing the data for the outfit
        release (str): Release containing the outfit
    """
    # Groups of attributes to parse
    int_attributes = ['cost', 'outfit_space', 'engine_capacity', 'weapon_capacity', 'cargo_space', 'gun_ports', 'turret_mounts', 'spinal_mounts', 'fuel_capacity', 'bunks', 'required_crew', 'cooling_inefficiency', 'depleted_shield_delay', 'energy_capacity', 'radar_jamming', 'jump_fuel', 'hyperdrive', 'jumpdrive', 'cargo_scan_power', 'cargo_scan_speed', 'outfit_scan_power', 'outfit_scan_speed', 'asteroid_scan_power', 'atmosphere_scan', 'tactical_scan_power', 'illegal', 'lifetime', 'range_override', 'firing_force', 'missile_strength', 'homing', 'trigger_radius', 'blast_radius', 'anti_missile', 'burst_count', 'burst_reload']
    float_attributes = ['mass', 'heat_dissipation', 'ramscoop', 'scan_interference', 'cloak', 'cloaking_energy', 'cloaking_fuel', 'capture_attack', 'capture_defense', 'inaccuracy', 'velocity', 'velocity_override', 'reload', 'firing_fuel', 'firing_heat', 'firing_energy', 'shield_damage', 'hull_damage', 'heat_damage', 'hit_force', 'piercing', 'acceleration', 'drag', 'tracking', 'infrared_tracking', 'radar_tracking', 'optical_tracking', 'turret_turn', 'ion_resistance', 'slowing_resistance']
    float_multi_60 = ['cooling', 'active_cooling', 'cooling_energy', 'solar_collection', 'energy_generation', 'heat_generation', 'energy_consumption', 'shield_generation', 'shield_energy', 'shield_heat', 'hull_repair_rate', 'hull_energy', 'hull_heat', 'thrusting_energy', 'thrusting_heat', 'turning_energy', 'turning_heat', 'reverse_thrusting_energy', 'reverse_thrusting_heat', 'afterburner_fuel', 'afterburner_heat', 'afterburner_energy']
    float_multi_3600 = ['thrust', 'reverse_thrust', 'afterburner_thrust']
    float_multi_100 = ['ion_damage', 'slowing_damage', 'disruption_damage']
    bool_attributes = ['automaton', 'unplunderable', 'cluster', 'stream']

    outfit = Outfit()
    
    outfit.release = release
    
    name = re.search('^outfit +?"([^"]*)"', outfit_string)
    if name:
        outfit.name = name[1]
    else:
        outfit.name = re.search('^outfit +?`([^`]*)`', outfit_string)[1]
    logger.debug("Current outfit is " + outfit.name)
    
    plural = re.search('^\tplural +?((?:"[^"]*")|(?:`[^`]*`))', outfit_string, re.M)
    if plural:
        outfit.plural = re.sub(r'^`|`$|^"|"$', '', plural[1])
    
    # Get faction from file name
    filename_substrings = re.findall(r'\b\w+\'?\w+\b', filename.stem)
    if len(filename_substrings) == 2:
        outfit.faction = filename_substrings[0].capitalize()
    elif filename_substrings[0] == 'pug':
        outfit.faction = 'Pug'
    else:
        outfit.faction = 'Human'

    license = re.search('^\t+licenses\n\t+["]?([^"]*?)["]?$', outfit_string, re.M)
    if license:
        outfit.license = license[1]    
    
    if outfit.faction == 'Human' and (outfit.license in ['Navy Auxiliary', 'City-Ship', 'Navy Carrier', 'Navy', 'Navy Cruiser', 'Militia'] or outfit.name in ['Electron Beam', 'Electron Turret', 'Flamethrower', 'Typhoon', 'Nuclear Missile', 'Cloaking Device', 'Jump Drive', 'Jump Drive (Broken)', 'Catalytic Ramscoop' ]):
        outfit.spoiler = 1

    if outfit.faction != 'Human':
        outfit.spoiler = 2
    
    if outfit.license in ['Heliarch', 'Unfettered Militia', 'Wanderer Military', 'Remnant Capital']:
        outfit.spoiler = 3

    descriptions = re.findall('^\tdescription +?((?:"[^"]*")|(?:`[^`]*`))', outfit_string, re.M)
    if descriptions:
        outfit.description = re.sub(r'^.\t|^`|`$|^"|"$', '', descriptions[0])
        if len(descriptions) == 2:
            outfit.description = outfit.description + '\n' + re.sub(r'^.\t|^`|`$|^"|"$', '', descriptions[1])

    category = re.search('^\tcategory +?"([^"]*)"', outfit_string, re.M)
    if category:
        outfit.category = category[1]
    if outfit.category == 'Engines':
        turn = parse_attribute_value('turn', outfit_string)
        turn and setattr(outfit, 'turn', float(turn[1]) * 60)

    thumbnail = re.search('^\tthumbnail +?"?([^"]*)"?$', outfit_string, re.M)
    if thumbnail:
        outfit.thumbnail = release + '/' + thumbnail[1] + '.png'

    for attribute in int_attributes:
        value = parse_attribute_value(attribute, outfit_string)
        value and setattr(outfit, attribute, int(value[1]))

    for attribute in float_attributes:
        value = parse_attribute_value(attribute, outfit_string)
        value and setattr(outfit, attribute, float(value[1]))

    for attribute in float_multi_60:
        value = parse_attribute_value(attribute, outfit_string)
        value and setattr(outfit, attribute, float(value[1]) * 60)

    for attribute in float_multi_3600:
        value = parse_attribute_value(attribute, outfit_string)
        value and setattr(outfit, attribute, float(value[1]) * 3600)

    for attribute in float_multi_100:
        value = parse_attribute_value(attribute, outfit_string)
        value and setattr(outfit, attribute, float(value[1]) * 100)

    for attribute in bool_attributes:
        value = re.search(r'^\t+?"?{}"?$'.format(attribute), outfit_string, re.M)
        value and setattr(outfit, attribute, True)

    # Calculate some aggregates
    outfit.combined_cooling = float(outfit.cooling + outfit.active_cooling)
    outfit.total_energy_generation = float(outfit.energy_generation + outfit.solar_collection)

    # Handle some special cases
    if outfit.hyperdrive and not outfit.jump_fuel:
        outfit.jump_fuel = 100

    ammo = re.search('^\t+?ammo +?"([^"]*)"', outfit_string, re.M)
    if ammo and ammo[1] not in ["Nuclear Missile", "Ka'het MHD Generator"]:
        try:
            outfit.ammo = Outfit.objects.filter(name=ammo[1], release=release).get()
        except Outfit.DoesNotExist: 
            logger.error(f"No matching ammo type found for '{ammo[1]}'!")

    ammo_capacity = re.search(r'^\t"[\w ]+?(?<!energy|engine|weapon)(?<!fuel) capacity" +?([\d\.-]*)$', outfit_string, re.M)
    if ammo_capacity:
        outfit.ammo_capacity = int(ammo_capacity[1])

    # Give outfit a more useful category
    determine_outfit_category(outfit)

    # Get submunition when applicable and copy relevant value to the outfit
    submunition = re.search(r'^\t+?"submunition" "([^"]*)" *?([\d\.-]*)$', outfit_string, re.M)
    if submunition:
        submunition_object = Outfit()
        try:
            submunition_object = Outfit.objects.filter(name=submunition[1], release=release).get()
            outfit.submunition_type = submunition_object
        except Outfit.DoesNotExist: 
            logger.error(f"No matching submunition type found for '{submunition[1]}'!")
        if submunition[2]:
            outfit.submunition_count = int(submunition[2])

        # Copy attributes from submunition to weapon
        copy_attributes = ["inaccuracy", "lifetime", "hull_damage", "shield_damage", "heat_damage", "ion_damage", "slowing_damage", "disruption_damage", "hit_force"]
        for attribute in copy_attributes:
            submunition_value = getattr(submunition_object, attribute)
            if submunition_value != 0:
                outfit_value = getattr(outfit, attribute)
                if attribute in ["lifetime", "hitforce"]:
                    setattr(outfit, attribute, int(outfit_value + submunition_value if attribute == "lifetime" else submunition_value or outfit.submunition_count == 0 * outfit.submunition_count))
                else:
                    setattr(outfit, attribute, float(outfit_value + submunition_value if attribute == "lifetime" else submunition_value or outfit.submunition_count == 0 * outfit.submunition_count))

    # Calculate average damage, now that all outfits have their damage values
    outfit.average_damage = float(outfit.shield_damage + outfit.hull_damage) / 2

    # Calculate aggregate values for weapons
    if outfit.category in ['Guns', 'Secondary Weapons', 'Turrets', 'Anti-missile']:

        # Range
        outfit.range = int(round(outfit.lifetime * outfit.velocity))
        # Shots/second
        outfit.shots_per_second = 60/outfit.reload

        # Calculate dps values
        if outfit.category == 'Anti-missile':
            outfit.anti_missile_dps = outfit.anti_missile * outfit.shots_per_second
            attribute_per_outfit_space(outfit, 'anti_missile_dps')
        else:
            outfit.shield_dps = outfit.shield_damage * outfit.shots_per_second
            outfit.hull_dps = outfit.hull_damage * outfit.shots_per_second
            outfit.average_dps = outfit.average_damage * outfit.shots_per_second
            outfit.heat_dps = outfit.heat_damage * outfit.shots_per_second
            outfit.ion_dps = outfit.ion_damage * outfit.shots_per_second
            outfit.slowing_dps = outfit.slowing_damage * outfit.shots_per_second
            outfit.disruption_dps = outfit.disruption_damage * outfit.shots_per_second
            outfit.hit_force_per_second = outfit.hit_force * outfit.shots_per_second

            # Calculate damage per outfit space
            dps_values = ['shield_dps', 'hull_dps', 'average_dps', 'heat_dps', 'ion_dps', 'slowing_dps', 'disruption_dps']
            for attribute in dps_values:
                attribute_per_outfit_space(outfit, attribute)                

        # Calculate resource use
        outfit.energy_per_second = outfit.firing_energy * outfit.shots_per_second
        outfit.heat_per_second = outfit.firing_heat * outfit.shots_per_second
        outfit.fuel_per_second = outfit.firing_fuel * outfit.shots_per_second
    
    # Calculate value per outfit space for beneficial stats
    generic_per_space = ['cooling', 'active_cooling', 'combined_cooling', 'energy_capacity', 'total_energy_generation', 'shield_generation', 'hull_repair_rate', 'ramscoop', 'thrust', 'turn', 'reverse_thrust', 'afterburner_thrust']
    for attribute in generic_per_space:
        attribute_per_outfit_space(outfit, attribute)

    fields = outfit.__dict__
    for key in fields:
        logger.debug(f"{key}: {fields[key]}")

    outfit.save()
    logger.info("Created outfit '" + outfit.name + "'")


def determine_outfit_category(outfit: Outfit):
    """
    Sub-divide outfits into more meaningful categories

    Args:
        outfit (Outfit): Outfit to be re-categorized
    """
    if outfit.category == 'Power':
        outfit.category = 'Batteries' if outfit.energy_capacity > 0 and outfit.energy_generation == 0 else 'Generators'
    if outfit.category == 'Systems':
        if (outfit.shield_generation or outfit.hull_repair_rate) > 0:
            outfit.category = 'Shields'
        if (outfit.cooling or outfit.active_cooling) > 0:
            outfit.category = 'Cooling'
        if outfit.name in ['Hyperdrive', 'Scram Drive', 'Jump Drive']:
            outfit.category = 'Hyperdrive'
    if outfit.category == 'Engines':
        if any((outfit.thrust > 0, outfit.reverse_thrust > 0, outfit.afterburner_thrust > 0)):
            outfit.category = 'Thruster'
        else: 
            outfit.category = 'Steering'
    if outfit.category == 'Turrets':
        if outfit.anti_missile > 0:
            outfit.category = 'Anti-missile'


def parse_attribute_value(attribute_name: str, outfit_string: str):
    """
    Finds the value of the specified attribute in the provided
    outfit string.

    Args:
        attribute_name (str): Name of the attribute
        outfit_string (str): String containing outfit information

    Returns:
        Match object: Match object returned by the regex search
                      where object[1] contains the actual value
    """
    search_term = 'anti-missile' if attribute_name == 'anti_missile' else re.sub(r'_', ' ', attribute_name)
    return re.search(r'^\t+?"?{}"? +?([\d\.-]*)$'.format(search_term), outfit_string, re.M)


def attribute_per_outfit_space(outfit: Outfit, attribute: str):
    """
    Calculates  and sets the attribute value per outfit space used by
    the outfit, given the attribute name.

    Args:
        outfit (Outfit): Outfit for which to set the attribute/outfit space
        attribute (str): Name of the attribute for which to calculate the attribute/outfit space
    """
    base_attribute_value = getattr(outfit, attribute)
    if base_attribute_value and outfit.outfit_space:
        attribute_name = f"{attribute}_per_space"
        attribute_value = float(base_attribute_value / abs(outfit.outfit_space))
        setattr(outfit, attribute_name, attribute_value)
        # logger.debug(f"Attribute name: {attribute_name} - Attribute value: {attribute_value}")

def parse_ships(filename: Path, release: str):
    """
    Turns a file containing ships into the respective Django
    model instances.
    
    First parses all 'full ships' into a Hull and its default Build.
    
    Then, based on the default Hull, creates a Hull for each variant 
    of a ship where the hull is affected (i.e. more engine capacity 
    etc.) and outfits may or may not be affected.

    Finally, creates a Build for each variant of a ship where
    the outfits are affected, but the hull is not.

    Args:
        filename (Path): Path to the file to be parsed
        release (str): Release containing the file
    """

    # Regex patterns for full ships, variants that alter the hull,
    # and variants that only alter the outfits
    full_ship_pattern = re.compile('^ship +?"[^"]*"$.*?(?=(?:^ship|^outfit|^effect|^fleet|^mission|\Z))', re.M|re.S)
    hull_variant_pattern = re.compile('^ship(?: "[^"]*"){2}$\n\t(?!outfits).*?(?=(?:^ship|^outfit|^effect|^fleet|^mission|\Z))', re.M|re.S)
    outfit_variant_pattern = re.compile('^ship(?: "[^"]*"){2}$\n\t(?=outfits).*?(?=(?:^ship|^outfit|^effect|^fleet|^mission|\Z))', re.M|re.S)

    # open files
    with open(filename) as file:
        
        logger.info("Opened ship file'" + str(filename) + "'")
        
        file_string = file.read()
        
        hull_counter = 0
        
        # Loop through full ships
        for full_ship in re.findall(full_ship_pattern, file_string):                        
            parse_full_ship(filename, full_ship, release)
            hull_counter += 1

        # Loop through hull variants
        for hull_variant in re.findall(hull_variant_pattern, file_string):
            parse_hull_variant(filename, hull_variant, release)
            hull_counter += 1

        # Loop through outfit variants
        for outfit_variant in re.findall(outfit_variant_pattern, file_string):
            parse_outfit_variant(outfit_variant, release)
            hull_counter += 1

        logger.info(f"Created {hull_counter} hulls in total.")
        

def parse_full_ship(filename: Path, full_ship: str, release: str):
    """
    Turns a 'full_ship' string into a Hull model instance and a
    Build model instance, containing the default build for the
    hull in question.

    Args:
        filename (Path): Path to the file containing the ship (to get the faction)
        full_ship (str): String containing all the data for the ship in question
        release (str): Release this ship is part of
    """

    hull = Hull()
    
    hull.release = release
    
    name = re.search('^ship +?`([^`]*)`', full_ship)
    if not name:
        name = re.search('^ship +?"([^"]*)"', full_ship)

    hull.name = name[1]
    logger.debug("Current hull is " + hull.name)
    
    # Default build is added at the end of hull creation
    
    plural = re.search('^\tplural +?((?:"[^"]*")|(?:`[^`]*`))', full_ship, re.M)
    if plural:
        hull.plural = re.sub(r'^`|`$|^"|"$', '', plural[1])
    
    # Get faction from file name
    filename_substrings = re.findall(r'\b\w+\'?\w+\b', filename.stem)
    if len(filename_substrings) == 2:
        hull.faction = filename_substrings[0].capitalize()
    elif filename_substrings[0] == 'pug':
        hull.faction = 'Pug'
    else:
        hull.faction = 'Human'

    license = re.search('^\t+licenses\n\t+["]?([^"]*?)["]?$', full_ship, re.M)
    if license:
        hull.license = license[1]
    
    if hull.faction == 'Human' and (hull.license in ['Navy Auxiliary', 'City-Ship', 'Navy Carrier', 'Navy', 'Navy Cruiser', 'Militia'] or hull.name in ['Unknown Ship Type', 'Kestrel', 'Dreadnought' ]):
        hull.spoiler = 1

    if hull.faction != 'Human':
        hull.spoiler = 2
    
    if hull.license in ['Heliarch', 'Unfettered Militia', 'Wanderer Military', 'Remnant Capital'] or hull.name in ['Arfecta'] or hull.faction in ['Sheragi']:
        hull.spoiler = 3

 
    # Ka'het 2/3?
    
    # Sheragi 2/3?
    
    # Unique?
        # Arfecta
        # Emerald Sword
        # Black Diamond?

    descriptions = re.findall('^\t+?description +?((?:"[^"]*")|(?:`[^`]*`))', full_ship, re.M)
    if descriptions:
        hull.description = re.sub(r'^.\t|^`|`$|^"|"$', '', descriptions[0])
        if len(descriptions) == 2:
            hull.description = hull.description + '\n' + re.sub(r'^.\t|^`|`$|^"|"$', '', descriptions[1])

    category = re.search('^\t+?category +?"?([^"]*?)"?$', full_ship, re.M)
    if category:
        hull.category = category[1]

    sprite = re.search('^\t+?sprite +?"?([^"]*)"?$', full_ship, re.M)
    if sprite:
        if hull.name in ['Penguin', 'Peregrine']:
            hull.sprite = release + '/' + sprite[1] + '-00.png'
        elif hull.name == 'Shuttle':
            hull.sprite = release + '/' + sprite[1] + '=2.png'
        else:
            hull.sprite = release + '/' + sprite[1] + '.png'

    thumbnail = re.search('^\t+?thumbnail +?"?([^"]*)"?$', full_ship, re.M)
    if thumbnail:
        hull.thumbnail = release + '/' + thumbnail[1] + '.png'

    if re.search('^\t+?"automaton"', full_ship, re.M):
        hull.automaton = True
    
    if re.search('^\t+?"?uncapturable"?', full_ship, re.M):
        hull.uncapturable = True
    
    cost = re.search(r'^\t+?"?cost"? (\d*)$', full_ship, re.M)
    if cost:
        hull.cost = int(cost[1])
    
    shields = re.search(r'^\t+?"?shields"? (\d*)$', full_ship, re.M)
    if shields:
        hull.shields = int(shields[1])

    hull_strength = re.search(r'^\t+?"?hull"? (\d*)$', full_ship, re.M)
    if hull_strength:
        hull.hull = int(hull_strength[1])

    hull.total_hp = hull.shields + hull.hull

    required_crew = re.search(r'^\t+?"required crew" +?([\d\.-]*)$', full_ship, re.M)
    if required_crew:
        hull.required_crew = int(required_crew[1])

    bunks = re.search(r'^\t+?"bunks" +?([\d\.-]*)$', full_ship, re.M)
    if bunks:
        hull.bunks = int(bunks[1])
    
    mass = re.search(r'^\t+?(?:"mass"|mass) +?([\d\.-]*)$', full_ship, re.M)
    if mass:
        hull.mass = float(mass[1])

    drag = re.search(r'^\t+?"drag" +?([\d\.-]*)$', full_ship, re.M)
    if drag:
        hull.drag = float(drag[1])

    heat_dissipation = re.search(r'^\t+?"heat dissipation" +?([\d\.-]*)$', full_ship, re.M)
    if heat_dissipation:
        hull.heat_dissipation = float(heat_dissipation[1])

    fuel_capacity = re.search(r'^\t+?"fuel capacity" +?([\d\.-]*)$', full_ship, re.M)
    if fuel_capacity:
        hull.fuel_capacity = int(fuel_capacity[1])

    cargo_space = re.search(r'^\t+?"cargo space" +?([\d\.-]*)$', full_ship, re.M)
    if cargo_space:
        hull.cargo_space = int(cargo_space[1])

    outfit_space = re.search(r'^\t+?"outfit space" +?([\d\.-]*)$', full_ship, re.M)
    if outfit_space:
        hull.outfit_space = int(outfit_space[1])

    weapon_capacity = re.search(r'^\t+?"weapon capacity" +?([\d\.-]*)$', full_ship, re.M)
    if weapon_capacity:
        hull.weapon_capacity = int(weapon_capacity[1])

    engine_capacity = re.search(r'^\t+?"engine capacity" +?([\d\.-]*)$', full_ship, re.M)
    if engine_capacity:
        hull.engine_capacity = int(engine_capacity[1])

    ramscoop = re.search(r'^\t+?"ramscoop" +?([\d\.-]*)$', full_ship, re.M)
    if ramscoop:
        hull.ramscoop = float(ramscoop[1])

    energy_capacity = re.search(r'^\t+?"energy capacity" +?([\d\.-]*)$', full_ship, re.M)
    if energy_capacity:
        hull.energy_capacity = int(energy_capacity[1])

    energy_generation = re.search(r'^\t+?"energy generation" +?([\d\.-]*)$', full_ship, re.M)
    if energy_generation:
        hull.energy_generation = float(energy_generation[1]) * 60

    heat_generation = re.search(r'^\t+?"heat generation" +?([\d\.-]*)$', full_ship, re.M)
    if heat_generation:
        hull.heat_generation = float(heat_generation[1]) * 60

    hull_repair_rate = re.search(r'^\t+?"hull repair.*?" +?([\d\.-]*)$', full_ship, re.M)
    if hull_repair_rate:
        hull.hull_repair_rate = float(hull_repair_rate[1]) * 60

    hull_energy = re.search(r'^\t+?"hull energy" +?([\d\.-]*)$', full_ship, re.M)
    if hull_energy:
        hull.hull_energy = float(hull_energy[1]) * 60

    hull_delay = re.search(r'^\t+?"hull delay" +?([\d\.-]*)$', full_ship, re.M)
    if hull_delay:
        hull.hull_delay = float(hull_delay[1])

    shield_generation = re.search(r'^\t+?"shield generation" +?([\d\.-]*)$', full_ship, re.M)
    if shield_generation:
        hull.shield_generation = float(shield_generation[1]) * 60

    shield_energy = re.search(r'^\t+?"shield energy" +?([\d\.-]*)$', full_ship, re.M)
    if shield_energy:
        hull.shield_energy = float(shield_energy[1]) * 60

    shield_heat = re.search(r'^\t+?"shield heat" +?([\d\.-]*)$', full_ship, re.M)
    if shield_heat:
        hull.shield_heat = float(shield_heat[1]) * 60

    cooling = re.search(r'^\t+?"cooling" +?([\d\.-]*)$', full_ship, re.M)
    if cooling:
        hull.cooling = float(cooling[1]) * 60

    active_cooling = re.search(r'^\t+?"active cooling" +?([\d\.-]*)$', full_ship, re.M)
    if active_cooling:
        hull.active_cooling = float(active_cooling[1]) * 60

    cooling_energy = re.search(r'^\t+?"cooling energy" +?([\d\.-]*)$', full_ship, re.M)
    if cooling_energy:
        hull.cooling_energy = float(cooling_energy[1]) * 60

    cloak = re.search(r'^\t+?"cloak" +?([\d\.-]*)$', full_ship, re.M)
    if cloak:
        hull.cloak = float(cloak[1])

    cloaking_energy = re.search(r'^\t+?"cloaking energy" +?([\d\.-]*)$', full_ship, re.M)
    if cloaking_energy:
        hull.cloaking_energy = float(cloaking_energy[1]) * 60

    cloaking_fuel = re.search(r'^\t+?"cloaking fuel" +?([\d\.-]*)$', full_ship, re.M)
    if cloaking_fuel:
        hull.cloaking_fuel = float(cloaking_fuel[1]) * 60

    thrust = re.search(r'^\t+?"thrust" +?([\d\.-]*)$', full_ship, re.M)
    if thrust:
        hull.thrust = float(thrust[1]) * 3600

    turn = re.search(r'^\t+?"turn" +?([\d\.-]*)$', full_ship, re.M)
    if turn:
        hull.turn = float(turn[1]) * 60

    reverse_thrust = re.search(r'^\t+?"reverse thrust" +?([\d\.-]*)$', full_ship, re.M)
    if reverse_thrust:
        hull.reverse_thrust = float(reverse_thrust[1]) * 3600

    reverse_thrusting_energy = re.search(r'^\t+?"reverse thrusting energy" +?([\d\.-]*)$', full_ship, re.M)
    if reverse_thrusting_energy:
        hull.reverse_thrusting_energy = float(reverse_thrusting_energy[1]) * 60

    reverse_thrusting_heat = re.search(r'^\t+?"reverse thrusting heat" +?([\d\.-]*)$', full_ship, re.M)
    if reverse_thrusting_heat:
        hull.reverse_thrusting_heat = float(reverse_thrusting_heat[1]) * 60

    outfit_scan_power = re.search(r'^\t+?"outfit scan power" +?([\d\.-]*)$', full_ship, re.M)
    if outfit_scan_power:
        hull.outfit_scan_power = int(outfit_scan_power[1])

    outfit_scan_speed = re.search(r'^\t+?"outfit scan speed" +?([\d\.-]*)$', full_ship, re.M)
    if outfit_scan_speed:
        hull.outfit_scan_speed = int(outfit_scan_speed[1])

    tactical_scan_power = re.search(r'^\t+?"tactical scan power" +?([\d\.-]*)$', full_ship, re.M)
    if tactical_scan_power:
        hull.tactical_scan_power = int(tactical_scan_power[1])

    asteroid_scan_power = re.search(r'^\t+?"asteroid scan power" +?([\d\.-]*)$', full_ship, re.M)
    if asteroid_scan_power:
        hull.asteroid_scan_power = int(asteroid_scan_power[1])

    atmosphere_scan = re.search(r'^\t+?"atmosphere scan" +?([\d\.-]*)$', full_ship, re.M)
    if atmosphere_scan:
        hull.atmosphere_scan = int(atmosphere_scan[1])

    burn_protection = re.search(r'^\t+?"burn protection" +?([\d\.-]*)$', full_ship, re.M)
    if burn_protection:
        hull.burn_protection = float(burn_protection[1])

    corrosion_protection = re.search(r'^\t+?"corrosion protection" +?([\d\.-]*)$', full_ship, re.M)
    if corrosion_protection:
        hull.corrosion_protection = float(corrosion_protection[1])

    discharge_protection = re.search(r'^\t+?"discharge protection" +?([\d\.-]*)$', full_ship, re.M)
    if discharge_protection:
        hull.discharge_protection = float(discharge_protection[1])

    disruption_protection = re.search(r'^\t+?"disruption protection" +?([\d\.-]*)$', full_ship, re.M)
    if disruption_protection:
        hull.disruption_protection = float(disruption_protection[1])

    energy_protection = re.search(r'^\t+?"energy protection" +?([\d\.-]*)$', full_ship, re.M)
    if energy_protection:
        hull.energy_protection = float(energy_protection[1])

    force_protection = re.search(r'^\t+?"force protection" +?([\d\.-]*)$', full_ship, re.M)
    if force_protection:
        hull.force_protection = float(force_protection[1])

    fuel_protection = re.search(r'^\t+?"fuel protection" +?([\d\.-]*)$', full_ship, re.M)
    if fuel_protection:
        hull.fuel_protection = float(fuel_protection[1])

    heat_protection = re.search(r'^\t+?"heat protection" +?([\d\.-]*)$', full_ship, re.M)
    if heat_protection:
        hull.heat_protection = float(heat_protection[1])

    hull_protection = re.search(r'^\t+?"hull protection" +?([\d\.-]*)$', full_ship, re.M)
    if hull_protection:
        hull.hull_protection = float(hull_protection[1])

    ion_protection = re.search(r'^\t+?"ion protection" +?([\d\.-]*)$', full_ship, re.M)
    if ion_protection:
        hull.ion_protection = float(ion_protection[1])

    leak_protection = re.search(r'^\t+?"leak protection" +?([\d\.-]*)$', full_ship, re.M)
    if leak_protection:
        hull.leak_protection = float(leak_protection[1])

    piercing_protection = re.search(r'^\t+?"piercing protection" +?([\d\.-]*)$', full_ship, re.M)
    if piercing_protection:
        hull.piercing_protection = float(piercing_protection[1])

    shield_protection = re.search(r'^\t+?"shield protection" +?([\d\.-]*)$', full_ship, re.M)
    if shield_protection:
        hull.shield_protection = float(shield_protection[1])

    slowing_protection = re.search(r'^\t+?"slowing protection" +?([\d\.-]*)$', full_ship, re.M)
    if slowing_protection:
        hull.slowing_protection = float(slowing_protection[1])

    ion_resistance = re.search(r'^\t+?"ion resistance" +?([\d\.-]*)$', full_ship, re.M)
    if ion_resistance:
        hull.ion_resistance = float(ion_resistance[1])

    slowing_resistance = re.search(r'^\t+?"slowing resistance" +?([\d\.-]*)$', full_ship, re.M)
    if slowing_resistance:
        hull.slowing_resistance = float(slowing_resistance[1])

    if re.search('^\t+?"gaslining"', full_ship, re.M):
        hull.gaslining = True

    if re.search('^\t+?"remnant node"', full_ship, re.M):
        hull.remnant_node = True

    hull.gun_ports = len(re.findall('^\t+?gun ', full_ship, re.M))
    hull.turret_mounts = len(re.findall('^\t+?turret ', full_ship, re.M))

    # Fighter and drone bays had a different syntax before 0.9.13
    fighters_old = len(re.findall('^\t+?fighter', full_ship, re.M))
    fighters_new = len(re.findall('^\t+?bay +?"Fighter"', full_ship, re.M))
    hull.fighter_bays = fighters_old if fighters_old > fighters_new else fighters_new

    drones_old = len(re.findall('^\t+?drone', full_ship, re.M))
    drones_new = len(re.findall('^\t+?bay +?"Drone"', full_ship, re.M))
    hull.drone_bays = drones_old if drones_old > drones_new else drones_new
    
    hull.spinal_mount = len(re.findall('\t+?"spinal mount"', full_ship, re.M))

    # Calculate aggregarte values for hull
    hull = calc_hull_aggregates(hull)

    hull.save()
    logger.info(f"Created hull '{hull.name}'")
    
    outfits_list = re.search('\toutfits(.*?)(?=^\t\w+)', full_ship, re.M|re.S)[1]
    
    hull.default_build = parse_build(hull, outfits_list, True)

    hull.save()
    logger.info(f"Added '{hull.default_build}' to '{hull.name}'")


def parse_build(hull: Hull, outfits_list: str, default=False):
    """
    Creates a build for the provided Hull based on the provided outfit_list string.

    Args:
        hull (Hull): The hull with which the build is associated
        outfits_list (string): Substring (extracted from the full_ship string), 
                               containing a list of all outfits of the build 
                               and their amounts
        default (bool) (optional): Whether the build is a default build. Default
                                   value is False

    Returns:
        Build: The build created by the function
    """
    
    build = Build()

    if not default:
        name = re.search('^ship +?(?:`[^`]*`) `([^`]*)`', outfits_list)
        if not name:
            name = re.search('^ship +?(?:"[^"]*") "([^"]*)"', outfits_list)
    
    build.name = hull.name + " Default Build" if default else "Build variant " + name[1]

    logger.info(f"Creating '{build.name}':")

    build.hull = hull

    build.save()

    for outfit_group in re.findall('^\t{2}["`]?([\w"][^`\t$]+?)["`]? ?(\d+)?$', outfits_list, re.M):
        amount = int(outfit_group[1]) if outfit_group[1] else 1
        try:
            outfit = Outfit.objects.filter(name=outfit_group[0], release=hull.release).get()
            build.outfits.add(outfit, through_defaults={'amount': amount})
            logger.debug(f"Added outfit '{outfit}' to '{build}'.")
            # logger.debug(f"Current outfits: {[(outfit.outfit.name, outfit.amount) for outfit in Outfit_details.objects.filter(build=build)]}.\n")        
        except Outfit.DoesNotExist:
            logger.warning(f"No outfit '{outfit_group[0]}' found!")

    logger.info(f"'{build.name}' created")

    return build

def calc_hull_aggregates(hull: Hull):
    """
    Calcuates aggregate hull attributes that are derived from the base
    hull attributes

    Args:
        hull (Hull): Hull for which to calculate the aggregate attributes

    Returns:
        Hull: Hull with calculate aggregate attributes
    """
    logger.info(f"Calculating aggregate attributes for {hull.name}")

    max_mass = hull.mass + hull.outfit_space + hull.cargo_space
    hull.speed_rating = hull.engine_capacity / hull.drag
    hull.agility_rating = (hull.engine_capacity / max_mass) * 100

    return hull


def parse_hull_variant(filename: Path, hull_variant: str, release: str):
    """
    Creates a hull variant from the provided hull_variant string.

    Args:
        filename (Path): Path to the file containing the hull variant
        hull_variant (string): String containing all relevant data on the hull variant
        release (string): Release name
    """
    # Handle special case "Barb" "Barb (Proton)" from 0.9.13 or earler (i.e. hull variants that have a full ship definition)
    if re.search('^\tattributes$(?!\n\tadd)', hull_variant, re.M|re.S):
        parse_full_ship(filename, hull_variant, release)
        return
    
    # Copy data from base model
    # Get Name of original Hull from 'hull_variant'
    parent_name = re.search('^ship +?`([^`]*)`', hull_variant)
    if not parent_name:
        parent_name = re.search('^ship +?"([^"]*)"', hull_variant)
    
    hull = Hull()
    
    try:
        hull = Hull.objects.filter(name=parent_name[1], release=release).get()
    except Hull.DoesNotExist:
        logger.error(f"Could not find parent hull '{parent_name}'.")

    hull.base_model = Hull.objects.filter(name=parent_name[1], release=release).get()

    name = re.search('^ship +?(?:`[^`]*`) `([^`]*)`', hull_variant)
    if not name:
        name = re.search('^ship +?(?:"[^"]*") "([^"]*)"', hull_variant)   
    hull.name = name[1]
    
    # Reset primary key, so that a new hull is created on save
    hull.pk = None
    
    # Buffer default build and outfits
    default_build = hull.default_build
    default_outfits = default_build.outfits.all()

    # Remove default build to satisfy unique requirement
    hull.default_build = None

    # Make necessary changes:
    # Adjust plural, sprite, and thumbnail, if necessary.
    plural = re.search('^\tplural +?((?:"[^"]*")|(?:`[^`]*`))', hull_variant, re.M)
    if plural:
        hull.plural = re.sub(r'^`|`$|^"|"$', '', plural[1])

    sprite = re.search('^\t+?sprite +?"([^"]*)"', hull_variant, re.M)
    if sprite:
        hull.sprite = release + '/' + sprite[1] + '.png'

    thumbnail = re.search('^\t+?thumbnail +?"([^"]*)"', hull_variant, re.M)
    if thumbnail:
        hull.thumbnail = release + '/' + thumbnail[1] + '.png'

    # Loop through 'add attributes' section, if any
    attributes = re.search('^\tadd attributes\n(.*?)(?:(?:^\t[^\t])|(?:^\t*$))', hull_variant, re.M|re.S)
    if attributes:
        for attr in re.findall('^\t\t"([^"]*)" +?([\d\.-]*)(?:$|\Z)', attributes[1], re.M|re.S):
            # Adjust values as necessary
            # Replace space in attribute name with '_'
            field_name = re.sub(' ', '_', attr[0])
            # Get the field value
            if not hasattr(hull, field_name):
                logger.error(f"Hull does not have field '{field_name}'")
                continue

            else:
                field_value = getattr(hull, field_name)
                logger.debug(f"Field value is {field_value}")
            # Set new value, depending on variable type
            if isinstance(field_value, int):
                setattr(hull, field_name, field_value + int(attr[1]))
            elif isinstance(field_value, decimal.Decimal):
                setattr(hull, field_name, field_value + decimal.Decimal(attr[1]))
            else:
                logger.error(f"Field '{field_name}' has unexpected (non-numerical) type '{type(field_value)}''.")

    # Count number of [guns, turrets, fighers, drones, spinal mounts], if any
    gun_ports = len(re.findall('^\t+?gun ', hull_variant, re.M))
    turret_mounts = len(re.findall('^\t+?turret ', hull_variant, re.M))
    fighter_bays = len(re.findall('^\t+?bay +?"Fighter"', hull_variant, re.M))
    drone_bays = len(re.findall('^\t+?bay +?"Drone"', hull_variant, re.M))
    spinal_mount = len(re.findall('\t+?"spinal mount"', hull_variant, re.M))
    weaponry = (gun_ports > 0, turret_mounts > 0, fighter_bays > 0, drone_bays > 0, spinal_mount > 0)
    if any(weaponry):
        hull.gun_ports = gun_ports
        hull.turret_mounts = turret_mounts
        hull.fighter_bays = fighter_bays
        hull.drone_bays = drone_bays
        hull.spinal_mount = spinal_mount

    # Update description, if any
    descriptions = re.findall('^\t+?description +?((?:"[^"]*")|(?:`[^`]*`))', hull_variant, re.M)
    if descriptions:
        hull.description = re.sub(r'^.\t|^`|`$|^"|"$', '', descriptions[0])
        if len(descriptions) == 2:
            hull.description = hull.description + '\n' + re.sub(r'^.\t|^`|`$|^"|"$', '', descriptions[1])

    # Calculate aggregate values
    hull = calc_hull_aggregates(hull)

    hull.save()
    logger.info(f"Created hull variant '{hull.name}'")

    # Determine default build  
    outfits_list = re.search('\toutfits(.*?)(?=^\t\w+)', hull_variant, re.M|re.S)
    # If outfit section exists
    if outfits_list:
        hull.default_build = parse_build(hull, outfits_list[1], True)
        hull.save()
        logger.info(f"Added '{hull.default_build}' to '{hull.name}'")
    else:
        default_build.pk = None
        default_build.name = hull.name + " Default Build"
        default_build.hull = hull
        default_build.save()
        default_build.outfits.set(default_outfits)
        logger.info(f"Cloned '{default_build.name}' from parent default build")
        hull.default_build = default_build
        hull.save()
        logger.info(f"Added '{hull.default_build}' to '{hull.name}'")


def parse_outfit_variant(outfit_variant: str, release: str):
    """
    Creates a build variant for a hull (no hull changes)
    from the provided outfit_variant string

    Args:
        outfit_variant (string): String containing all relevant information on the build
        release (string): Release name
    """
    # Get Name of parent Hull from 'outfit_variant'
    parent_name = re.search('^ship +?`([^`]*)`', outfit_variant)
    if not parent_name:
        parent_name = re.search('^ship +?"([^"]*)"', outfit_variant)
    
    hull = Hull()
    
    try:
        hull = Hull.objects.filter(name=parent_name[1], release=release).get()
    except Hull.DoesNotExist:
        logger.error(f"Could not find parent hull '{parent_name}'.")

    parse_build(hull, outfit_variant)
