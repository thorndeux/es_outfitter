from django.db import models

class Hull(models.Model):
    release = models.CharField(max_length=20)
    spoiler = models.IntegerField(default=0)
    base_model = models.ForeignKey("self",
                                   null=True,
                                   blank=True,
                                   default=None,
                                   on_delete=models.CASCADE,
                                   related_name='variants')
    default_build = models.OneToOneField("Build",
                                         null=True,
                                         blank=True,
                                         default=None,
                                         on_delete=models.CASCADE,
                                         related_name='is_default')

    name = models.CharField(max_length=40)
    plural = models.CharField(max_length=40)
    faction = models.CharField(max_length=40)
    description = models.CharField(max_length=1000)
    category = models.CharField(max_length=40, blank=True)
    license = models.CharField(max_length=80)
    
    sprite = models.CharField(max_length=40)
    thumbnail = models.CharField(max_length=40)

    automaton = models.BooleanField(default=False)
    uncapturable = models.BooleanField(default=False)
    
    cost = models.IntegerField(default=0)
    shields = models.IntegerField(default=0)
    hull = models.IntegerField(default=0)

    # some aggregates
    total_hp = models.IntegerField(default=0)
    speed_rating = models.DecimalField(default=0, max_digits=6, decimal_places=2)
    agility_rating = models.DecimalField(default=0, max_digits=6, decimal_places=2)

    required_crew = models.IntegerField(default=0)
    bunks = models.IntegerField(default=0)

    mass = models.IntegerField(default=0)
    drag = models.DecimalField(default=0, max_digits=6, decimal_places=2)

    heat_dissipation = models.DecimalField(default=0, max_digits=6, decimal_places=2)
    fuel_capacity = models.IntegerField(default=0)

    cargo_space = models.IntegerField(default=0)
    outfit_space = models.IntegerField(default=0)
    weapon_capacity = models.IntegerField(default=0)
    engine_capacity = models.IntegerField(default=0)
    ramscoop = models.IntegerField(default=0)

    energy_capacity = models.IntegerField(default=0)
    energy_generation = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    heat_generation = models.IntegerField(default=0)
    
    hull_repair_rate = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    hull_energy = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    hull_delay = models.IntegerField(default=0)
    
    shield_generation = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    shield_energy = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    shield_heat = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    
    cooling = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    active_cooling = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    cooling_energy = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    
    cloak = models.DecimalField(default=0, max_digits=6, decimal_places=2)
    cloaking_energy = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    cloaking_fuel = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    
    thrust = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    turn = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    reverse_thrust = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    reverse_thrusting_energy = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    reverse_thrusting_heat = models.DecimalField(default=0, max_digits=8, decimal_places=2)

    outfit_scan_power = models.IntegerField(default=0)
    outfit_scan_speed = models.IntegerField(default=0)
    tactical_scan_power = models.IntegerField(default=0)
    asteroid_scan_power = models.IntegerField(default=0)
    atmosphere_scan = models.IntegerField(default=0)

    force_protection = models.DecimalField(default=0, max_digits=4, decimal_places=2)
    heat_protection = models.DecimalField(default=0, max_digits=4, decimal_places=2)
    ion_protection = models.DecimalField(default=0, max_digits=6, decimal_places=2)
    ion_resistance = models.DecimalField(default=0, max_digits=6, decimal_places=2)
    slowing_resistance = models.DecimalField(default=0, max_digits=6, decimal_places=2)

    gaslining = models.BooleanField(default=False)
    remnant_node = models.IntegerField(default=0)

    gun_ports = models.IntegerField(default=0)
    turret_mounts = models.IntegerField(default=0)
    fighter_bays = models.IntegerField(default=0)
    drone_bays = models.IntegerField(default=0)
    spinal_mount = models.IntegerField(default=0)

    def __str__(self):
        return self.name
    

class Outfit(models.Model):
    release = models.CharField(max_length=20)
    spoiler = models.IntegerField(default=0)
    
    name = models.CharField(max_length=40)
    plural = models.CharField(max_length=40, blank=True)
    faction = models.CharField(max_length=40)
    description = models.CharField(max_length=1400)
    category = models.CharField(max_length=40)
    license = models.CharField(max_length=80)

    thumbnail = models.CharField(max_length=40)
    
    automaton = models.BooleanField(default=False)
    unplunderable = models.BooleanField(default=False)

    cost = models.IntegerField(default=0)
    
    mass = models.DecimalField(default=0, max_digits=7, decimal_places=3)
    outfit_space = models.IntegerField(default=0)
    engine_capacity = models.IntegerField(default=0)
    weapon_capacity = models.IntegerField(default=0)
    cargo_space = models.IntegerField(default=0)
    gun_ports = models.IntegerField(default=0)
    turret_mounts = models.IntegerField(default=0)
    spinal_mounts = models.IntegerField(default=0)
    fuel_capacity = models.IntegerField(default=0)
    
    bunks = models.IntegerField(default=0)
    required_crew = models.IntegerField(default=0)
    
    cooling = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    active_cooling = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    combined_cooling = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    combined_cooling_per_space = models.DecimalField(default=0, max_digits=7, decimal_places=2)
    cooling_energy = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    cooling_inefficiency = models.IntegerField(default=0)
    heat_dissipation = models.DecimalField(default=0, max_digits=6, decimal_places=2)
    depleted_shield_delay = models.IntegerField(default=0)

    energy_capacity = models.IntegerField(default=0)
    energy_capacity_per_space = models.DecimalField(default=0, max_digits=7, decimal_places=2)
    solar_collection = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    energy_generation = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    total_energy_generation = models.DecimalField(default=0, max_digits=9, decimal_places=2)
    total_energy_generation_per_space = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    heat_generation = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    energy_consumption = models.DecimalField(default=0, max_digits=8, decimal_places=3)

    shield_generation = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    shield_generation_per_space = models.DecimalField(default=0, max_digits=7, decimal_places=2)
    shield_energy = models.DecimalField(default=0, max_digits=6, decimal_places=2)
    shield_heat = models.DecimalField(default=0, max_digits=8, decimal_places=2)

    hull_repair_rate = models.DecimalField(default=0, max_digits=6, decimal_places=2)
    hull_repair_rate_per_space = models.DecimalField(default=0, max_digits=6, decimal_places=2)
    hull_energy = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    hull_heat = models.DecimalField(default=0, max_digits=5, decimal_places=2)

    radar_jamming = models.IntegerField(default=0)
    
    ramscoop = models.DecimalField(default=0, max_digits=4, decimal_places=2)
    ramscoop_per_space = models.DecimalField(default=0, max_digits=4, decimal_places=2)
    
    jump_fuel = models.IntegerField(default=0)
    hyperdrive = models.IntegerField(default=0)
    jumpdrive = models.IntegerField(default=0)    
    
    cargo_scan_power = models.IntegerField(default=0)
    cargo_scan_speed = models.IntegerField(default=0)
    
    outfit_scan_power = models.IntegerField(default=0)
    outfit_scan_speed = models.IntegerField(default=0)

    asteroid_scan_power = models.IntegerField(default=0)

    tactical_scan_power = models.IntegerField(default=0)

    atmosphere_scan = models.IntegerField(default=0)

    scan_interference = models.DecimalField(default=0, max_digits=4, decimal_places=2)

    cloak = models.DecimalField(default=0, max_digits=6, decimal_places=2)
    cloaking_energy = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    cloaking_fuel = models.DecimalField(default=0, max_digits=8, decimal_places=2)

    capture_attack = models.DecimalField(default=0, max_digits=4, decimal_places=2)
    capture_defense = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    
    thrust = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    thrust_per_space = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    thrusting_energy = models.DecimalField(default=0, max_digits=8, decimal_places=3)
    thrusting_heat = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    
    turn = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    turn_per_space = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    turning_energy = models.DecimalField(default=0, max_digits=8, decimal_places=3)
    turning_heat = models.DecimalField(default=0, max_digits=8, decimal_places=3)
    
    reverse_thrust = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    reverse_thrust_per_space = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    reverse_thrusting_energy = models.DecimalField(default=0, max_digits=8, decimal_places=3)
    reverse_thrusting_heat = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    
    afterburner_thrust = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    afterburner_thrust_per_space = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    afterburner_fuel = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    afterburner_heat = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    afterburner_energy = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    
    illegal = models.IntegerField(default=0)

    inaccuracy = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    
    velocity = models.DecimalField(default=0, max_digits=7, decimal_places=3)
    lifetime = models.IntegerField(default=0)    
    range_override = models.IntegerField(default=0)   
    velocity_override = models.DecimalField(default=0, max_digits=7, decimal_places=3)
    reload = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    
    firing_energy = models.DecimalField(default=0, max_digits=7, decimal_places=2)
    firing_heat = models.DecimalField(default=0, max_digits=7, decimal_places=2)
    firing_fuel = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    firing_force = models.IntegerField(default=0)
    
    shield_damage = models.DecimalField(default=0, max_digits=7, decimal_places=2)
    hull_damage = models.DecimalField(default=0, max_digits=7, decimal_places=2)
    average_damage = models.DecimalField(default=0, max_digits=7, decimal_places=2)
    heat_damage = models.DecimalField(default=0, max_digits=7, decimal_places=2)
    ion_damage = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    slowing_damage = models.DecimalField(default=0, max_digits=7, decimal_places=2)
    disruption_damage = models.DecimalField(default=0, max_digits=7, decimal_places=2)
    hit_force = models.IntegerField(default=0)
    piercing = models.DecimalField(default=0, max_digits=4, decimal_places=2)

    # Aggregate values
    range = models.DecimalField(default=0, max_digits=7, decimal_places=2)
    shots_per_second = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    # DPS values
    shield_dps = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    hull_dps = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    average_dps = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    heat_dps = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    ion_dps = models.DecimalField(default=0, max_digits=9, decimal_places=2)
    slowing_dps = models.DecimalField(default=0, max_digits=7, decimal_places=2)
    disruption_dps = models.DecimalField(default=0, max_digits=7, decimal_places=2)
    hit_force_per_second = models.DecimalField(default=0, max_digits=7, decimal_places=2)
    anti_missile_dps = models.DecimalField(default=0, max_digits=7, decimal_places=2)
    # Resource use per second
    energy_per_second = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    heat_per_second = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    fuel_per_second = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    # DPS per outfit space
    shield_dps_per_space = models.DecimalField(default=0, max_digits=7, decimal_places=2)
    hull_dps_per_space = models.DecimalField(default=0, max_digits=7, decimal_places=2)
    average_dps_per_space = models.DecimalField(default=0, max_digits=7, decimal_places=2)
    heat_dps_per_space = models.DecimalField(default=0, max_digits=7, decimal_places=2)
    ion_dps_per_space = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    slowing_dps_per_space = models.DecimalField(default=0, max_digits=6, decimal_places=2)
    disruption_dps_per_space = models.DecimalField(default=0, max_digits=6, decimal_places=2)
    anti_missile_dps_per_space = models.DecimalField(default=0, max_digits=6, decimal_places=2)
    
    ammo_capacity = models.IntegerField(default=0)
    missile_strength = models.IntegerField(default=0)
    ammo = models.ForeignKey("self",
                             null=True,
                             blank=True,
                             default=None,
                             on_delete=models.CASCADE,
                             related_name='launcher')
    acceleration = models.DecimalField(default=0, max_digits=8, decimal_places=5)
    drag = models.DecimalField(default=0, max_digits=4, decimal_places=3)
    homing = models.IntegerField(default=0)
    tracking = models.DecimalField(default=0, max_digits=2, decimal_places=1)
    
    infrared_tracking = models.DecimalField(default=0, max_digits=3, decimal_places=2)
    radar_tracking = models.DecimalField(default=0, max_digits=3, decimal_places=2)
    optical_tracking = models.DecimalField(default=0, max_digits=3, decimal_places=2)

    trigger_radius = models.IntegerField(default=0)
    blast_radius = models.IntegerField(default=0)

    burst_count = models.IntegerField(default=0)
    burst_reload = models.IntegerField(default=0)
    
    cluster = models.BooleanField(default=False)
    
    submunition_type = models.ForeignKey("self",
                                         null=True,
                                         blank=True,
                                         default=None,
                                         on_delete=models.CASCADE,
                                         related_name='main_ammo')
    submunition_count = models.IntegerField(default=0)
    
    stream = models.BooleanField(default=False)

    # korath mine submunition
    # arfecta gridfire turret
        # phasing

    anti_missile = models.IntegerField(default=0)

    turret_turn = models.DecimalField(default=0, max_digits=4, decimal_places=2)

    ion_resistance = models.DecimalField(default=0, max_digits=4, decimal_places=3)
    slowing_resistance = models.DecimalField(default=0, max_digits=4, decimal_places=3)
    
    def __str__(self):
        return self.name
    

class Build(models.Model):
    name = models.CharField(max_length=40)
    hull = models.ForeignKey(Hull, on_delete=models.CASCADE, related_name='builds')
    outfits = models.ManyToManyField(Outfit, through='Outfit_details')

    def __str__(self):
        return self.name

class Outfit_details(models.Model):
    outfit = models.ForeignKey(Outfit, on_delete=models.CASCADE)
    build = models.ForeignKey(Build, on_delete=models.CASCADE, related_name='outfit_details')
    amount = models.IntegerField(default=1)