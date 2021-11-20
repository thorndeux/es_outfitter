"""
Contains functions to download and process the raw data
of the different Endless Sky releases
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

def get_release(release):
    """
    Downloads the specified release, unzips it, copies ship/outfit text files 
    and images to appropriate locations, and removes unnecessary files

    Args:
        release (string): Release name (e.g. '0.9.12' or 'continuous')
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
        logger.info(f"Data directory for {release} already exists.")

    try:
        (static / release).mkdir()
        logger.info(f'Created static directory {str(static / release)}')
    except FileExistsError:
        logger.info(f"Static directory for {release} already exists.")

    # Copy relevant files to data directory
    # Relevant files include these substrings
    substrings = ['engines', 'kestrel', 'marauders', 'outfits', 'power', 'pug', 'ships', 'variants', 'weapons']

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
            shutil.copytree(item, (static / release / item.name), dirs_exist_ok=True)
            logger.info(f"Copied image folder '{item.name}'")

    # Delete zip file
    (raw / (release + '.zip')).unlink()
    logger.info("Deleted .zip file")

    # Delete unzipped data
    shutil.rmtree(raw / ('endless-sky-' + release))
    logger.info("Deleted unnecessary raw data")


def parse_raw(release):
    """
    Parses the raw data of a given release,
    populating the Outfit and Hull models.
    Outfits are created first, as they are
    referenced in Builds.

    Args:
        release (String): Name of the release (e.g. '0.9.12' or 'continuous')
    """
    # Path of release raw data
    raw = Path(settings.BASE_DIR / 'data_api' / 'raw_data' / release)

    if not raw.exists():
        logger.warning(f"No raw data available for release {release}.")
        return
    else:
        logger.info(f"Parsing release '{release}'")

    # Outfit files are those text files that contain any of the given substrings
    outfit_files = [file for file in raw.rglob('*.txt') \
                    if any(substring in file.stem for substring in \
                    ['engines', 'outfits', 'power', 'pug', 'weapons'])]
 
    # Ship files are those text files that contain any of the given substrings
    ship_files = [file for file in raw.rglob('*.txt') \
                  if any(substring in file.stem for substring in \
                  ['kestrel', 'marauders', 'pug', 'ships'])]

    # Parse outfit files
    for file in outfit_files:
        logger.info(f"Parsing outfit file '{file.name}'")
        parse_outfits(file, release)

    # Parse ship files
    for file in ship_files:
        logger.info(f"Parsing ship file '{file.name}'")
        parse_ships(file, release)


def parse_outfits(filename, release):
    """
    Parses a given file, searching for outfits and 
    creating an Outfit model instance for each result.

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


def create_outfit(filename, outfit_string, release):

    outfit = Outfit()
    
    outfit.release = release
    
    name = re.search('^outfit "([^"]*)"', outfit_string)

    if not name:
        name = re.search('^outfit `([^`]*)`', outfit_string)

    outfit.name = name[1]
    logger.debug("Current outfit is " + outfit.name)
    
    plural = re.search('^\tplural ((?:"[^"]*")|(?:`[^`]*`))', outfit_string, re.M)
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

    descriptions = re.findall('^\tdescription ((?:"[^"]*")|(?:`[^`]*`))', outfit_string, re.M)
    if descriptions:
        outfit.description = re.sub(r'^.\t|^`|`$|^"|"$', '', descriptions[0])
        if len(descriptions) == 2:
            outfit.description = outfit.description + '\n' + re.sub(r'^.\t|^`|`$|^"|"$', '', descriptions[1])

    category = re.search('^\tcategory "([^"]*)"', outfit_string, re.M)
    if category:
        outfit.category = category[1]

    thumbnail = re.search('^\tthumbnail "?([^"]*)"?$', outfit_string, re.M)
    if thumbnail:
        outfit.thumbnail = release + '/' + thumbnail[1] + '.png'

    if re.search('^\t"automaton"', outfit_string, re.M):
        outfit.automaton = True
    
    if re.search('^\t"?unplunderable"?', outfit_string, re.M):
        outfit.unplunderable = True
    
    cost = re.search(r'^\t"?cost"? (\d*)$', outfit_string, re.M)
    if cost:
        outfit.cost = int(cost[1])

    mass = re.search(r'^\t(?:"mass"|mass) ([\d\.-]*)$', outfit_string, re.M)
    if mass:
        outfit.mass = float(mass[1])

    outfit_space = re.search(r'^\t"outfit space" ([\d\.-]*)$', outfit_string, re.M)
    if outfit_space:
        outfit.outfit_space = int(outfit_space[1])

    engine_capacity = re.search(r'^\t"engine capacity" ([\d\.-]*)$', outfit_string, re.M)
    if engine_capacity:
        outfit.engine_capacity = int(engine_capacity[1])

    weapon_capacity = re.search(r'^\t"weapon capacity" ([\d\.-]*)$', outfit_string, re.M)
    if weapon_capacity:
        outfit.weapon_capacity = int(weapon_capacity[1])

    cargo_space = re.search(r'^\t"cargo space" ([\d\.-]*)$', outfit_string, re.M)
    if cargo_space:
        outfit.cargo_space = int(cargo_space[1])
    
    gun_ports = re.search(r'^\t"gun ports" ([\d\.-]*)$', outfit_string, re.M)
    if gun_ports:
        outfit.gun_ports = int(gun_ports[1])

    turret_mounts = re.search(r'^\t"turret mounts" ([\d\.-]*)$', outfit_string, re.M)
    if turret_mounts:
        outfit.turret_mounts = int(turret_mounts[1])

    fuel_capacity = re.search(r'^\t"fuel capacity" ([\d\.-]*)$', outfit_string, re.M)
    if fuel_capacity:
        outfit.fuel_capacity = int(fuel_capacity[1])

    bunks = re.search(r'^\t"bunks" ([\d\.-]*)$', outfit_string, re.M)
    if bunks:
        outfit.bunks = int(bunks[1])

    required_crew = re.search(r'^\t"required crew" ([\d\.-]*)$', outfit_string, re.M)
    if required_crew:
        outfit.required_crew = int(required_crew[1])

    cooling = re.search(r'^\t"cooling" ([\d\.-]*)$', outfit_string, re.M)
    if cooling:
        outfit.cooling = float(cooling[1])

    active_cooling = re.search(r'^\t"active cooling" ([\d\.-]*)$', outfit_string, re.M)
    if active_cooling:
        outfit.active_cooling = float(active_cooling[1])

    cooling_energy = re.search(r'^\t"cooling energy" ([\d\.-]*)$', outfit_string, re.M)
    if cooling_energy:
        outfit.cooling_energy = float(cooling_energy[1])

    cooling_inefficiency = re.search(r'^\t"cooling inefficiency" ([\d\.-]*)$', outfit_string, re.M)
    if cooling_inefficiency:
        outfit.cooling_inefficiency = int(cooling_inefficiency[1])

    heat_dissipation = re.search(r'^\t"heat dissipation" ([\d\.-]*)$', outfit_string, re.M)
    if heat_dissipation:
        outfit.heat_dissipation = float(heat_dissipation[1])

    depleted_shield_delay = re.search(r'^\t"depleted shield delay" ([\d\.-]*)$', outfit_string, re.M)
    if depleted_shield_delay:
        outfit.depleted_shield_delay = int(depleted_shield_delay[1])

    energy_capacity = re.search(r'^\t"energy capacity" ([\d\.-]*)$', outfit_string, re.M)
    if energy_capacity:
        outfit.energy_capacity = int(energy_capacity[1])

    solar_collection = re.search(r'^\t"solar collection" ([\d\.-]*)$', outfit_string, re.M)
    if solar_collection:
        outfit.solar_collection = float(solar_collection[1])

    energy_generation = re.search(r'^\t"energy generation" ([\d\.-]*)$', outfit_string, re.M)
    if energy_generation:
        outfit.energy_generation = float(energy_generation[1])

    heat_generation = re.search(r'^\t"heat generation" ([\d\.-]*)$', outfit_string, re.M)
    if heat_generation:
        outfit.heat_generation = float(heat_generation[1])

    energy_consumption = re.search(r'^\t"energy consumption" ([\d\.-]*)$', outfit_string, re.M)
    if energy_consumption:
        outfit.energy_consumption = float(energy_consumption[1])

    shield_generation = re.search(r'^\t"shield generation" ([\d\.-]*)$', outfit_string, re.M)
    if shield_generation:
        outfit.shield_generation = float(shield_generation[1])

    shield_energy = re.search(r'^\t"shield energy" ([\d\.-]*)$', outfit_string, re.M)
    if shield_energy:
        outfit.shield_energy = float(shield_energy[1])

    shield_heat = re.search(r'^\t"shield heat" ([\d\.-]*)$', outfit_string, re.M)
    if shield_heat:
        outfit.shield_heat = float(shield_heat[1])

    hull_repair_rate = re.search(r'^\t"hull repair.*?" ([\d\.-]*)$', outfit_string, re.M)
    if hull_repair_rate:
        outfit.hull_repair_rate = float(hull_repair_rate[1])

    hull_energy = re.search(r'^\t"hull energy" ([\d\.-]*)$', outfit_string, re.M)
    if hull_energy:
        outfit.hull_energy = float(hull_energy[1])

    hull_heat = re.search(r'^\t"hull heat" ([\d\.-]*)$', outfit_string, re.M)
    if hull_heat:
        outfit.hull_heat = float(hull_heat[1])

    radar_jamming = re.search(r'^\t"radar jamming" ([\d\.-]*)$', outfit_string, re.M)
    if radar_jamming:
        outfit.radar_jamming = int(radar_jamming[1])

    ramscoop = re.search(r'^\t"ramscoop" ([\d\.-]*)$', outfit_string, re.M)
    if ramscoop:
        outfit.ramscoop = float(ramscoop[1])

    jump_fuel = re.search(r'^\t"jump fuel" ([\d\.-]*)$', outfit_string, re.M)
    if jump_fuel:
        outfit.jump_fuel = int(jump_fuel[1])

    hyperdrive = re.search(r'^\t"hyperdrive" ([\d\.-]*)$', outfit_string, re.M)
    if hyperdrive:
        outfit.hyperdrive = int(hyperdrive[1])

    if hyperdrive and not jump_fuel:
        outfit.jump_fuel = 100

    jumpdrive = re.search(r'^\t"jump drive" ([\d\.-]*)$', outfit_string, re.M)
    if jumpdrive:
        outfit.jumpdrive = int(jumpdrive[1])

    cargo_scan_power = re.search(r'^\t"cargo scan power" ([\d\.-]*)$', outfit_string, re.M)
    if cargo_scan_power:
        outfit.cargo_scan_power = int(cargo_scan_power[1])

    cargo_scan_speed = re.search(r'^\t"cargo scan speed" ([\d\.-]*)$', outfit_string, re.M)
    if cargo_scan_speed:
        outfit.cargo_scan_speed = int(cargo_scan_speed[1])

    outfit_scan_power = re.search(r'^\t"outfit scan power" ([\d\.-]*)$', outfit_string, re.M)
    if outfit_scan_power:
        outfit.outfit_scan_power = int(outfit_scan_power[1])

    outfit_scan_speed = re.search(r'^\t"outfit scan speed" ([\d\.-]*)$', outfit_string, re.M)
    if outfit_scan_speed:
        outfit.outfit_scan_speed = int(outfit_scan_speed[1])

    asteroid_scan_power = re.search(r'^\t"asteroid scan power" ([\d\.-]*)$', outfit_string, re.M)
    if asteroid_scan_power:
        outfit.asteroid_scan_power = int(asteroid_scan_power[1])

    atmosphere_scan = re.search(r'^\t"atmosphere scan" ([\d\.-]*)$', outfit_string, re.M)
    if atmosphere_scan:
        outfit.atmosphere_scan = int(atmosphere_scan[1])

    tactical_scan_power = re.search(r'^\t"tactical scan power" ([\d\.-]*)$', outfit_string, re.M)
    if tactical_scan_power:
        outfit.tactical_scan_power = int(tactical_scan_power[1])

    scan_interference = re.search(r'^\t"scan interference" ([\d\.-]*)$', outfit_string, re.M)
    if scan_interference:
        outfit.scan_interference = float(scan_interference[1])

    cloak = re.search(r'^\t"cloak" ([\d\.-]*)$', outfit_string, re.M)
    if cloak:
        outfit.cloak = float(cloak[1])

    cloaking_energy = re.search(r'^\t"cloaking energy" ([\d\.-]*)$', outfit_string, re.M)
    if cloaking_energy:
        outfit.cloaking_energy = float(cloaking_energy[1])

    cloaking_fuel = re.search(r'^\t"cloaking fuel" ([\d\.-]*)$', outfit_string, re.M)
    if cloaking_fuel:
        outfit.cloaking_fuel = float(cloaking_fuel[1])

    capture_attack = re.search(r'^\t"capture attack" ([\d\.-]*)$', outfit_string, re.M)
    if capture_attack:
        outfit.capture_attack = float(capture_attack[1])

    capture_defense = re.search(r'^\t"capture defense" ([\d\.-]*)$', outfit_string, re.M)
    if capture_defense:
        outfit.capture_defense = float(capture_defense[1])

    thrust = re.search(r'^\t"thrust" ([\d\.-]*)$', outfit_string, re.M)
    if thrust:
        outfit.thrust = float(thrust[1])

    thrusting_energy = re.search(r'^\t"thrusting energy" ([\d\.-]*)$', outfit_string, re.M)
    if thrusting_energy:
        outfit.thrusting_energy = float(thrusting_energy[1])

    thrusting_heat = re.search(r'^\t"thrusting heat" ([\d\.-]*)$', outfit_string, re.M)
    if thrusting_heat:
        outfit.thrusting_heat = float(thrusting_heat[1])

    turn = re.search(r'^\t+?"turn" ([\d\.-]*)$', outfit_string, re.M)
    if turn:
        outfit.turn = float(turn[1])

    turning_energy = re.search(r'^\t"turning energy" ([\d\.-]*)$', outfit_string, re.M)
    if turning_energy:
        outfit.turning_energy = float(turning_energy[1])

    turning_heat = re.search(r'^\t"turning heat" ([\d\.-]*)$', outfit_string, re.M)
    if turning_heat:
        outfit.turning_heat = float(turning_heat[1])

    reverse_thrust = re.search(r'^\t"reverse thrust" ([\d\.-]*)$', outfit_string, re.M)
    if reverse_thrust:
        outfit.reverse_thrust = float(reverse_thrust[1])

    reverse_thrusting_energy = re.search(r'^\t"reverse thrusting energy" ([\d\.-]*)$', outfit_string, re.M)
    if reverse_thrusting_energy:
        outfit.reverse_thrusting_energy = float(reverse_thrusting_energy[1])

    reverse_thrusting_heat = re.search(r'^\t"reverse thrusting heat" ([\d\.-]*)$', outfit_string, re.M)
    if reverse_thrusting_heat:
        outfit.reverse_thrusting_heat = float(reverse_thrusting_heat[1])

    afterburner_thrust = re.search(r'^\t"afterburner thrust" ([\d\.-]*)$', outfit_string, re.M)
    if afterburner_thrust:
        outfit.afterburner_thrust = float(afterburner_thrust[1])

    afterburner_fuel = re.search(r'^\t"afterburner fuel" ([\d\.-]*)$', outfit_string, re.M)
    if afterburner_fuel:
        outfit.afterburner_fuel = float(afterburner_fuel[1])

    afterburner_heat = re.search(r'^\t"afterburner heat" ([\d\.-]*)$', outfit_string, re.M)
    if afterburner_heat:
        outfit.afterburner_heat = float(afterburner_heat[1])

    afterburner_energy = re.search(r'^\t"afterburner energy" ([\d\.-]*)$', outfit_string, re.M)
    if afterburner_energy:
        outfit.afterburner_energy = float(afterburner_energy[1])

    illegal = re.search(r'^\t"illegal" ([\d\.-]*)$', outfit_string, re.M)
    if illegal:
        outfit.illegal = int(illegal[1])

    inaccuracy = re.search(r'^\t+?"inaccuracy" ([\d\.-]*)$', outfit_string, re.M)
    if inaccuracy:
        outfit.inaccuracy = float(inaccuracy[1])

    velocity = re.search(r'^\t+?"velocity" ([\d\.-]*)$', outfit_string, re.M)
    if velocity:
        outfit.velocity = float(velocity[1])

    lifetime = re.search(r'^\t+?"lifetime" ([\d\.-]*)$', outfit_string, re.M)
    if lifetime:
        outfit.lifetime = int(lifetime[1])

    range_override = re.search(r'^\t+?"range override" ([\d\.-]*)$', outfit_string, re.M)
    if range_override:
        outfit.range_override = int(range_override[1])
    
    velocity_override = re.search(r'^\t+?"velocity override" ([\d\.-]*)$', outfit_string, re.M)
    if velocity_override:
        outfit.velocity_override = float(velocity_override[1])

    reload_time = re.search(r'^\t+?"reload" ([\d\.-]*)$', outfit_string, re.M)
    if reload_time:
        outfit.reload_time = float(reload_time[1])

    firing_fuel = re.search(r'^\t+?"firing fuel" ([\d\.-]*)$', outfit_string, re.M)
    if firing_fuel:
        outfit.firing_fuel = float(firing_fuel[1])

    firing_heat = re.search(r'^\t+?"firing heat" ([\d\.-]*)$', outfit_string, re.M)
    if firing_heat:
        outfit.firing_heat = float(firing_heat[1])

    firing_energy = re.search(r'^\t+?"firing energy" ([\d\.-]*)$', outfit_string, re.M)
    if firing_energy:
        outfit.firing_energy = float(firing_energy[1])

    firing_force = re.search(r'^\t+?"firing force" ([\d\.-]*)$', outfit_string, re.M)
    if firing_force:
        outfit.firing_force = int(firing_force[1])

    shield_damage = re.search(r'^\t+?"shield damage" ([\d\.-]*)$', outfit_string, re.M)
    if shield_damage:
        outfit.shield_damage = float(shield_damage[1])

    hull_damage = re.search(r'^\t+?"hull damage" ([\d\.-]*)$', outfit_string, re.M)
    if hull_damage:
        outfit.hull_damage = float(hull_damage[1])

    heat_damage = re.search(r'^\t+?"heat damage" ([\d\.-]*)$', outfit_string, re.M)
    if heat_damage:
        outfit.heat_damage = float(heat_damage[1])

    ion_damage = re.search(r'^\t+?"ion damage" ([\d\.-]*)$', outfit_string, re.M)
    if ion_damage:
        outfit.ion_damage = float(ion_damage[1])

    slowing_damage = re.search(r'^\t+?"slowing damage" ([\d\.-]*)$', outfit_string, re.M)
    if slowing_damage:
        outfit.slowing_damage = float(slowing_damage[1])

    disruption_damage = re.search(r'^\t+?"disruption damage" ([\d\.-]*)$', outfit_string, re.M)
    if disruption_damage:
        outfit.disruption_damage = float(disruption_damage[1])

    hit_force = re.search(r'^\t+?"hit force" ([\d\.-]*)$', outfit_string, re.M)
    if hit_force:
        outfit.hit_force = int(hit_force[1])

    piercing = re.search(r'^\t+?"piercing" ([\d\.-]*)$', outfit_string, re.M)
    if piercing:
        outfit.piercing = float(piercing[1])

    missile_capacity = re.search(r'^\t"[\w ]+?(?<!energy|engine|weapon)(?<!fuel) capacity" ([\d\.-]*)$', outfit_string, re.M)
    if missile_capacity:
        outfit.missile_capacity = int(missile_capacity[1])

    missile_strength = re.search(r'^\t+?"missile strength" ([\d\.-]*)$', outfit_string, re.M)
    if missile_strength:
        outfit.missile_strength = int(missile_strength[1])

    ammo = re.search('^\t+?ammo "([^"]*)"', outfit_string, re.M)
    if ammo and ammo[1] not in ["Nuclear Missile", "Ka'het MHD Generator"]:
        try:
            outfit.ammo = Outfit.objects.filter(name=ammo[1], release=release).get()
        except Outfit.DoesNotExist: 
            logger.error(f"No matching ammo type found for '{ammo[1]}'!")

    acceleration = re.search(r'^\t+?"acceleration" ([\d\.-]*)$', outfit_string, re.M)
    if acceleration:
        outfit.acceleration = float(acceleration[1])

    drag = re.search(r'^\t+?"drag" ([\d\.-]*)$', outfit_string, re.M)
    if drag:
        outfit.drag = float(drag[1])

    homing = re.search(r'^\t+?"homing" ([\d\.-]*)$', outfit_string, re.M)
    if homing:
        outfit.homing = int(homing[1])

    tracking = re.search(r'^\t+?"tracking" ([\d\.-]*)$', outfit_string, re.M)
    if tracking:
        outfit.tracking = float(tracking[1])

    infrared_tracking = re.search(r'^\t+?"infrared tracking" ([\d\.-]*)$', outfit_string, re.M)
    if infrared_tracking:
        outfit.infrared_tracking = float(infrared_tracking[1])

    radar_tracking = re.search(r'^\t+?"radar tracking" ([\d\.-]*)$', outfit_string, re.M)
    if radar_tracking:
        outfit.radar_tracking = float(radar_tracking[1])

    optical_tracking = re.search(r'^\t+?"optical tracking" ([\d\.-]*)$', outfit_string, re.M)
    if optical_tracking:
        outfit.optical_tracking = float(optical_tracking[1])

    trigger_radius = re.search(r'^\t+?"trigger radius" ([\d\.-]*)$', outfit_string, re.M)
    if trigger_radius:
        outfit.trigger_radius = int(trigger_radius[1])

    blast_radius = re.search(r'^\t+?"blast radius" ([\d\.-]*)$', outfit_string, re.M)
    if blast_radius:
        outfit.blast_radius = int(blast_radius[1])

    anti_missile = re.search(r'^\t+?"anti-missile" ([\d\.-]*)$', outfit_string, re.M)
    if anti_missile:
        outfit.anti_missile = int(anti_missile[1])

    turret_turn = re.search(r'^\t+?"turret turn" ([\d\.-]*)$', outfit_string, re.M)
    if turret_turn:
        outfit.turret_turn = float(turret_turn[1])

    ion_resistance = re.search(r'^\t+?"ion resistance" ([\d\.-]*)$', outfit_string, re.M)
    if ion_resistance:
        outfit.ion_resistance = float(ion_resistance[1])

    slowing_resistance = re.search(r'^\t+?"slowing resistance" ([\d\.-]*)$', outfit_string, re.M)
    if slowing_resistance:
        outfit.slowing_resistance = float(slowing_resistance[1])

    burst_count = re.search(r'^\t+?"burst count" ([\d\.-]*)$', outfit_string, re.M)
    if burst_count:
        outfit.burst_count = int(burst_count[1])

    burst_reload = re.search(r'^\t+?"burst reload" ([\d\.-]*)$', outfit_string, re.M)
    if burst_reload:
        outfit.burst_reload = int(burst_reload[1])

    cluster = re.search(r'^\t+?"?cluster"?$', outfit_string, re.M)
    if cluster:
        outfit.cluster = True

    stream = re.search(r'^\t+?"?stream"?$', outfit_string, re.M)
    if stream:
        outfit.stream = True

    submunition = re.search(r'^\t+?"submunition" "([^"]*)" ([\d\.-]*)$', outfit_string, re.M)
    if submunition:
        try:
            outfit.submunition_type = Outfit.objects.filter(name=submunition[1], release=release).get()
        except Outfit.DoesNotExist: 
            logger.error(f"No matching submunition type found for '{submunition[1]}'!")
        outfit.submunition_count = int(submunition[2])

    outfit.save()
    logger.info("Created outfit '" + outfit.name + "'")


def parse_ships(filename, release):

    # Regex patterns for full ships, variants that alter the hull,
    # and variants that only alter the outfits
    full_ship_pattern = re.compile('^ship "[^"]*"$.*?(?=(?:^ship|^outfit|^effect|^fleet|^mission|\Z))', re.M|re.S)
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

def parse_full_ship(filename, full_ship, release):

    hull = Hull()
    
    hull.release = release
    
    name = re.search('^ship `([^`]*)`', full_ship)
    if not name:
        name = re.search('^ship "([^"]*)"', full_ship)

    hull.name = name[1]
    logger.debug("Current hull is " + hull.name)
    
    # Default build is added at the end of hull creation
    
    plural = re.search('^\tplural ((?:"[^"]*")|(?:`[^`]*`))', full_ship, re.M)
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
    
    if hull.license in ['Heliarch', 'Unfettered Militia', 'Wanderer Military', 'Remnant Capital'] or hull.name in ['Arfecta'] or hull.faction in ['Quarg']:
        hull.spoiler = 3

 
    # Ka'het 2/3?
    
    # Sheragi 2/3?
    
    # Unique?
        # Arfecta
        # Emerald Sword
        # Black Diamond?

    descriptions = re.findall('^\t+?description ((?:"[^"]*")|(?:`[^`]*`))', full_ship, re.M)
    if descriptions:
        hull.description = re.sub(r'^.\t|^`|`$|^"|"$', '', descriptions[0])
        if len(descriptions) == 2:
            hull.description = hull.description + '\n' + re.sub(r'^.\t|^`|`$|^"|"$', '', descriptions[1])

    category = re.search('^\t+?category "([^"]*)"', full_ship, re.M)
    if category:
        hull.category = category[1]

    sprite = re.search('^\t+?sprite "?([^"]*)"?$', full_ship, re.M)
    if sprite:
        if hull.name in ['Penguin', 'Peregrine']:
            hull.sprite = release + '/' + sprite[1] + '-00.png'
        elif hull.name == 'Shuttle':
            hull.sprite = release + '/' + sprite[1] + '=2.png'
        else:
            hull.sprite = release + '/' + sprite[1] + '.png'

    thumbnail = re.search('^\t+?thumbnail "?([^"]*)"?$', full_ship, re.M)
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

    required_crew = re.search(r'^\t+?"required crew" ([\d\.-]*)$', full_ship, re.M)
    if required_crew:
        hull.required_crew = int(required_crew[1])

    bunks = re.search(r'^\t+?"bunks" ([\d\.-]*)$', full_ship, re.M)
    if bunks:
        hull.bunks = int(bunks[1])
    
    mass = re.search(r'^\t+?(?:"mass"|mass) ([\d\.-]*)$', full_ship, re.M)
    if mass:
        hull.mass = float(mass[1])

    drag = re.search(r'^\t+?"drag" ([\d\.-]*)$', full_ship, re.M)
    if drag:
        hull.drag = float(drag[1])

    heat_dissipation = re.search(r'^\t+?"heat dissipation" ([\d\.-]*)$', full_ship, re.M)
    if heat_dissipation:
        hull.heat_dissipation = float(heat_dissipation[1])

    fuel_capacity = re.search(r'^\t+?"fuel capacity" ([\d\.-]*)$', full_ship, re.M)
    if fuel_capacity:
        hull.fuel_capacity = int(fuel_capacity[1])

    cargo_space = re.search(r'^\t+?"cargo space" ([\d\.-]*)$', full_ship, re.M)
    if cargo_space:
        hull.cargo_space = int(cargo_space[1])

    outfit_space = re.search(r'^\t+?"outfit space" ([\d\.-]*)$', full_ship, re.M)
    if outfit_space:
        hull.outfit_space = int(outfit_space[1])

    weapon_capacity = re.search(r'^\t+?"weapon capacity" ([\d\.-]*)$', full_ship, re.M)
    if weapon_capacity:
        hull.weapon_capacity = int(weapon_capacity[1])

    engine_capacity = re.search(r'^\t+?"engine capacity" ([\d\.-]*)$', full_ship, re.M)
    if engine_capacity:
        hull.engine_capacity = int(engine_capacity[1])

    ramscoop = re.search(r'^\t+?"ramscoop" ([\d\.-]*)$', full_ship, re.M)
    if ramscoop:
        hull.ramscoop = float(ramscoop[1])

    energy_capacity = re.search(r'^\t+?"energy capacity" ([\d\.-]*)$', full_ship, re.M)
    if energy_capacity:
        hull.energy_capacity = int(energy_capacity[1])

    energy_generation = re.search(r'^\t+?"energy generation" ([\d\.-]*)$', full_ship, re.M)
    if energy_generation:
        hull.energy_generation = float(energy_generation[1])

    heat_generation = re.search(r'^\t+?"heat generation" ([\d\.-]*)$', full_ship, re.M)
    if heat_generation:
        hull.heat_generation = float(heat_generation[1])

    hull_repair_rate = re.search(r'^\t+?"hull repair.*?" ([\d\.-]*)$', full_ship, re.M)
    if hull_repair_rate:
        hull.hull_repair_rate = float(hull_repair_rate[1])

    hull_energy = re.search(r'^\t+?"hull energy" ([\d\.-]*)$', full_ship, re.M)
    if hull_energy:
        hull.hull_energy = float(hull_energy[1])

    hull_delay = re.search(r'^\t+?"hull delay" ([\d\.-]*)$', full_ship, re.M)
    if hull_delay:
        hull.hull_delay = float(hull_delay[1])

    shield_generation = re.search(r'^\t+?"shield generation" ([\d\.-]*)$', full_ship, re.M)
    if shield_generation:
        hull.shield_generation = float(shield_generation[1])

    shield_energy = re.search(r'^\t+?"shield energy" ([\d\.-]*)$', full_ship, re.M)
    if shield_energy:
        hull.shield_energy = float(shield_energy[1])

    shield_heat = re.search(r'^\t+?"shield heat" ([\d\.-]*)$', full_ship, re.M)
    if shield_heat:
        hull.shield_heat = float(shield_heat[1])

    cooling = re.search(r'^\t+?"cooling" ([\d\.-]*)$', full_ship, re.M)
    if cooling:
        hull.cooling = float(cooling[1])

    active_cooling = re.search(r'^\t+?"active cooling" ([\d\.-]*)$', full_ship, re.M)
    if active_cooling:
        hull.active_cooling = float(active_cooling[1])

    cooling_energy = re.search(r'^\t+?"cooling energy" ([\d\.-]*)$', full_ship, re.M)
    if cooling_energy:
        hull.cooling_energy = float(cooling_energy[1])

    cloak = re.search(r'^\t+?"cloak" ([\d\.-]*)$', full_ship, re.M)
    if cloak:
        hull.cloak = float(cloak[1])

    cloaking_energy = re.search(r'^\t+?"cloaking energy" ([\d\.-]*)$', full_ship, re.M)
    if cloaking_energy:
        hull.cloaking_energy = float(cloaking_energy[1])

    cloaking_fuel = re.search(r'^\t+?"cloaking fuel" ([\d\.-]*)$', full_ship, re.M)
    if cloaking_fuel:
        hull.cloaking_fuel = float(cloaking_fuel[1])

    thrust = re.search(r'^\t+?"thrust" ([\d\.-]*)$', full_ship, re.M)
    if thrust:
        hull.thrust = float(thrust[1])

    turn = re.search(r'^\t+?"turn" ([\d\.-]*)$', full_ship, re.M)
    if turn:
        hull.turn = float(turn[1])

    reverse_thrust = re.search(r'^\t+?"reverse thrust" ([\d\.-]*)$', full_ship, re.M)
    if reverse_thrust:
        hull.reverse_thrust = float(reverse_thrust[1])

    reverse_thrusting_energy = re.search(r'^\t+?"reverse thrusting energy" ([\d\.-]*)$', full_ship, re.M)
    if reverse_thrusting_energy:
        hull.reverse_thrusting_energy = float(reverse_thrusting_energy[1])

    reverse_thrusting_heat = re.search(r'^\t+?"reverse thrusting heat" ([\d\.-]*)$', full_ship, re.M)
    if reverse_thrusting_heat:
        hull.reverse_thrusting_heat = float(reverse_thrusting_heat[1])

    outfit_scan_power = re.search(r'^\t+?"outfit scan power" ([\d\.-]*)$', full_ship, re.M)
    if outfit_scan_power:
        hull.outfit_scan_power = int(outfit_scan_power[1])

    outfit_scan_speed = re.search(r'^\t+?"outfit scan speed" ([\d\.-]*)$', full_ship, re.M)
    if outfit_scan_speed:
        hull.outfit_scan_speed = int(outfit_scan_speed[1])

    tactical_scan_power = re.search(r'^\t+?"tactical scan power" ([\d\.-]*)$', full_ship, re.M)
    if tactical_scan_power:
        hull.tactical_scan_power = int(tactical_scan_power[1])

    asteroid_scan_power = re.search(r'^\t+?"asteroid scan power" ([\d\.-]*)$', full_ship, re.M)
    if asteroid_scan_power:
        hull.asteroid_scan_power = int(asteroid_scan_power[1])

    atmosphere_scan = re.search(r'^\t+?"atmosphere scan" ([\d\.-]*)$', full_ship, re.M)
    if atmosphere_scan:
        hull.atmosphere_scan = int(atmosphere_scan[1])

    force_protection = re.search(r'^\t+?"force protection" ([\d\.-]*)$', full_ship, re.M)
    if force_protection:
        hull.force_protection = float(force_protection[1])

    heat_protection = re.search(r'^\t+?"heat protection" ([\d\.-]*)$', full_ship, re.M)
    if heat_protection:
        hull.heat_protection = float(heat_protection[1])

    ion_protection = re.search(r'^\t+?"ion protection" ([\d\.-]*)$', full_ship, re.M)
    if ion_protection:
        hull.ion_protection = float(ion_protection[1])

    ion_resistance = re.search(r'^\t+?"ion resistance" ([\d\.-]*)$', full_ship, re.M)
    if ion_resistance:
        hull.ion_resistance = float(ion_resistance[1])

    slowing_resistance = re.search(r'^\t+?"slowing resistance" ([\d\.-]*)$', full_ship, re.M)
    if slowing_resistance:
        hull.slowing_resistance = float(slowing_resistance[1])

    if re.search('^\t+?"gaslining"', full_ship, re.M):
        hull.gaslining = True

    if re.search('^\t+?"remnant node"', full_ship, re.M):
        hull.remnant_node = True

    hull.max_guns = len(re.findall('^\t+?gun ', full_ship, re.M))
    hull.max_turrets = len(re.findall('^\t+?turret ', full_ship, re.M))

    # Fighter and drone bays had a different syntax before 0.9.13
    fighters_old = len(re.findall('^\t+?fighter', full_ship, re.M))
    fighters_new = len(re.findall('^\t+?bay "Fighter"', full_ship, re.M))
    hull.max_fighters = fighters_old if fighters_old > fighters_new else fighters_new

    drones_old = len(re.findall('^\t+?drone', full_ship, re.M))
    drones_new = len(re.findall('^\t+?bay "Drone"', full_ship, re.M))
    hull.max_drones = drones_old if drones_old > drones_new else drones_new
    
    hull.spinal_mount = len(re.findall('\t+?"spinal mount"', full_ship, re.M))

    hull.save()
    logger.info(f"Created hull '{hull.name}'")
    
    outfits_list = re.search('\toutfits(.*?)(?=\t\w+)', full_ship, re.M|re.S)[1]
    
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
                                   is False

    Returns:
        Build: The build created by the function
    """
    
    build = Build()

    if not default:
        name = re.search('^ship (?:`[^`]*`) `([^`]*)`', outfits_list)
        if not name:
            name = re.search('^ship (?:"[^"]*") "([^"]*)"', outfits_list)   
    
    build.name = hull.name + " Default Build" if default else "Build variant " + name[1]

    logger.info(f"Creating '{build.name}':")

    build.hull = hull

    build.save()

    for outfit_group in re.findall('^\t+"([^"]+)" ?(\d+)?$', outfits_list, re.M):
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


def parse_hull_variant(filename, hull_variant, release):
    """
    Creates a hull variant from the provided hull_variant string.

    Args:
        filename (string): Name of the file containing the hull variant
        hull_variant (string): String containing all relevant data on the hull variant
        release (string): Release name
    """
    # Handle special case "Barb" "Barb (Proton)" (i.e. hull variants that have a full ship definition)
    if re.search('^\tattributes$', hull_variant, re.M|re.S):
        parse_full_ship(filename, hull_variant, release)
        return
    
    # Copy data from base model
    # Get Name of original Hull from 'hull_variant'
    parent_name = re.search('^ship `([^`]*)`', hull_variant)
    if not parent_name:
        parent_name = re.search('^ship "([^"]*)"', hull_variant)
    
    hull = Hull()
    
    try:
        hull = Hull.objects.filter(name=parent_name[1], release=release).get()
    except Hull.DoesNotExist:
        logger.error(f"Could not find parent hull '{parent_name}'.")

    hull.base_model = Hull.objects.filter(name=parent_name[1], release=release).get()

    name = re.search('^ship (?:`[^`]*`) `([^`]*)`', hull_variant)
    if not name:
        name = re.search('^ship (?:"[^"]*") "([^"]*)"', hull_variant)   
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
    plural = re.search('^\tplural ((?:"[^"]*")|(?:`[^`]*`))', hull_variant, re.M)
    if plural:
        hull.plural = re.sub(r'^`|`$|^"|"$', '', plural[1])

    sprite = re.search('^\t+?sprite "([^"]*)"', hull_variant, re.M)
    if sprite:
        hull.sprite = release + '/' + sprite[1] + '.png'

    thumbnail = re.search('^\t+?thumbnail "([^"]*)"', hull_variant, re.M)
    if thumbnail:
        hull.thumbnail = release + '/' + thumbnail[1] + '.png'

    # Loop through 'add attributes' section, if any
    attributes = re.search('^\tadd attributes\n(.*?)(?:(?:^\t[^\t])|(?:^\t*$))', hull_variant, re.M|re.S)
    if attributes:
        for attr in re.findall('^\t\t"([^"]*)" ([\d\.-]*)(?:$|\Z)', attributes[1], re.M|re.S):
            # Adjust values as necessary
            # Replace space in attribute name with '_'
            field_name = re.sub(' ', '_', attr[0])
            # Get the field value
            if not hasattr(hull, field_name):
                logger.error(f"Hull does not have field '{field_name}'")

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
    max_guns = len(re.findall('^\t+?gun ', hull_variant, re.M))
    max_turrets = len(re.findall('^\t+?turret ', hull_variant, re.M))
    max_fighters = len(re.findall('^\t+?bay "Fighter"', hull_variant, re.M))
    max_drones = len(re.findall('^\t+?bay "Drone"', hull_variant, re.M))
    spinal_mount = len(re.findall('\t+?"spinal mount"', hull_variant, re.M))
    weaponry = (max_guns > 0, max_turrets > 0, max_fighters > 0, max_drones > 0, spinal_mount > 0)
    if any(weaponry):
        hull.max_guns = max_guns
        hull.max_turrets = max_turrets
        hull.max_fighters = max_fighters
        hull.max_drones = max_drones
        hull.spinal_mount = spinal_mount

    # Update description, if any
    descriptions = re.findall('^\t+?description ((?:"[^"]*")|(?:`[^`]*`))', hull_variant, re.M)
    if descriptions:
        hull.description = re.sub(r'^.\t|^`|`$|^"|"$', '', descriptions[0])
        if len(descriptions) == 2:
            hull.description = hull.description + '\n' + re.sub(r'^.\t|^`|`$|^"|"$', '', descriptions[1])

    hull.save()
    logger.info(f"Created hull variant '{hull.name}'")

    # Determine default build  
    outfits_list = re.search('\toutfits(.*?)(?=\t\w+)', hull_variant, re.M|re.S)
    # If outfit section exists
    if outfits_list:
        hull.default_build = parse_build(hull, outfits_list[1], True)
        hull.save()
        logger.info(f"Added '{hull.default_build}' to '{hull.name}'")
    else:
        default_build.pk = None
        default_build.name = hull.name + " Default Build"
        default_build.save()
        default_build.outfits.set(default_outfits)
        logger.info(f"Cloned '{default_build.name}' from parent default build")
        hull.default_build = default_build
        hull.save()
        logger.info(f"Added '{hull.default_build}' to '{hull.name}'")


def parse_outfit_variant(outfit_variant, release):
    """
    Creates a build variant for a hull (no hull changes)
    from the provided outfit_variant string

    Args:
        outfit_variant (string): String containing all relevant information on the build
        release (string): Release name
    """
    # Get Name of parent Hull from 'outfit_variant'
    parent_name = re.search('^ship `([^`]*)`', outfit_variant)
    if not parent_name:
        parent_name = re.search('^ship "([^"]*)"', outfit_variant)
    
    hull = Hull()
    
    try:
        hull = Hull.objects.filter(name=parent_name[1], release=release).get()
    except Hull.DoesNotExist:
        logger.error(f"Could not find parent hull '{parent_name}'.")

    parse_build(hull, outfit_variant)
