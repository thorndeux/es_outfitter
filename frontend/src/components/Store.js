const initialState = {
  // Hull select view
  // Is the hull select view displayed?
  hullSelect: true,
  // All hulls of the selected release
  allHulls: [],
  // Hulls after select and sort filters are applied
  currentHulls: [],
  // Subset of currentHulls that match provided search term
  hullSearchResults: [],
  // Subset of currentHulls/hullSearchResults containing the first page
  // (12 results). Next 12 are added when you scroll to bottom.
  displayedHulls: [],
  // Currently selected release (shared with outfits)
  release: { value: '0.9.14', label: '0.9.14' },
  // Currently selected spoiler level (shared with outfits)
  spoiler: { value: '0', label: 'No Spoilers' },
  // Currently selected faction for hull view
  hullFaction: { value: 'Human', label: 'Human' },
  // Currently selected category for hull view
  hullCategory: { value: '', label: 'All Categories' },
  // Currently selected sort type for hull view (from select menu)
  hullSortType: { value: 'name', label: 'Name' },
  // Last attribute sorted by (from clicking on an attribute)
  hullSort: 'name',
  // Current search query for hull view
  hullSearchQuery: '',

  // Build view
  // Is build view displayed
  shipBuilder: false,
  // All outfits of the selected release
  allOutfits: [],
  // Outfits after select and sort filters are applied
  currentOutfits: [],
  // Subset of currentOutfits that match provided search term
  outfitSearchResults: [],
  // Subset of currentOutfits/outfitSearchResults containing the first page
  // (12 results). Next 12 are added when you scroll to bottom.
  displayedOutfits: [],
  // Currently selected faction for outfit view
  outfitFaction: { value: 'Human', label: 'Human' },
  // Currently selected category for outfit view
  outiftCategory: { value: '', label: 'All Categories' },
  // Currently selected sort type for outfit view (from select menu)
  outfitSortType: { value: 'name', label: 'Name' },
  // Last attribute sorted by (from clicking on an attribute)
  outfitSort: 'name',
  // Current search query for outfit view
  outfitSearchQuery: '',

  // All builds for the selected release
  allBuilds: [],
  // Currently selected hull for the build
  currentHull: {},
  // Default build for current hull
  defaultBuild: {},
  // All builds for the current hull
  hullBuilds: [],
  // User build, initially based on default build
  currentBuild: {},
  // All builds in local storage
  savedBuilds: [],
  // All builds in local storage for selected hull
  savedHullBuilds: [],
  // Track which keys are held down for multiplier
  shiftHeld: false,
  ctrlHeld: false,
  rightAltHeld: false,
  // String with current multiplier information for UI
  multi: '',
  // Collection of aggregate stats calculated from
  // current hull and outfits
  defenseAggregates: {
    hull: 0,
    hull_contributers: '',
    shields: 0,
    total_hp: 0,
    hull_regen: 0,
    shield_regen: 0,
    anti_missile_dps_contributers: '',
    anti_missile_dps: 0,
    average_heat: 0,    
  },
  mobilityAggregates: {
    max_speed: 0,
    acceleration_no_cargo: 0,
    acceleration_with_cargo: 0,
    turn_no_cargo: 0,
    turn_with_cargo: 0,
    mass_no_cargo: 0,
    mass_with_cargo: 0,
    fuel_capacity: 0,
    jump_fuel: 0,
    ramscoop: 0,
    firing_fuel: 0,
  },
  missionsAggregates: {
    cargo_space: 0,
    required_crew: 0,
    bunks: 0,
  },
  spaceAggregates: {
    total_outfit_space: 0,
    free_outfit_space: 0,
    total_engine_capacity: 0,
    free_engine_capacity: 0,
    total_weapon_capacity: 0,
    free_weapon_capacity: 0,
    total_guns: 0,
    free_guns: 0,
    total_turrets: 0,
    free_turrets: 0,
    total_fighter_bays: 0,
    free_fighter_bays: 0,
    total_drone_bays: 0,
    free_drone_bays: 0,
  },
  heatAggregates: {
    cooling_efficiency: 0,
    cooling: 0,
    active_cooling: 0,
    heat_generation: 0,
    idle_heat: 0,
    idle_heat_level: 0,
    thrusting_heat: 0,
    reverse_thrusting_heat: 0,
    turning_heat: 0,
    afterburner_heat: 0,
    moving_heat: 0,
    firing_heat: 0,
    shield_heat: 0,
    hull_heat: 0,
    action_heat: 0,
    action_heat_level: 0,
    heat_dissipation: 0,
    max_heat: 0,
  },
  energyAggregates: {
    energy_generation: 0,
    solar_collection: 0,
    energy_consumption: 0,
    cooling_energy: 0,
    idle_energy: 0,
    thrusting_energy: 0,
    reverse_thrusting_energy: 0,
    turning_energy: 0,
    afterburner_energy: 0,
    moving_energy: 0,
    firing_energy: 0,
    shield_energy: 0,
    hull_energy: 0,
    action_energy: 0,
    energy_capacity: 0,
  },
  offenseAggregates: {
    shield_dps: 0,
    hull_dps: 0,
    average_dps: 0,
    heat_dps: 0,
    ion_dps: 0,
    slowing_dps: 0,
    disruption_dps: 0,
    ammo_capacities: [],
  }
}

export default initialState