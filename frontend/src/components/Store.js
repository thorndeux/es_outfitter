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
  // TODO: Subset of currentHulls/hullSearchResults containing the first page
  // (20 results). Next 20 are added when you scroll to bottom.
  displayedHulls: [],
  // Currently selected release (shared with outfits)
  release: { value: '0.9.14', label: '0.9.14' },
  // Currently selected spoiler level (shared with outfits)
  spoiler: { value: '0', label: 'No Spoilers' },
  // Currently selected faction for hull view
  hullFaction: { value: 'Human', label: 'Human' },
  // Currently selected category for hull view
  hullCategory: { value: '', label: 'All Categories' },
  // Currently selected sort type for hull view
  hullSortType: { value: 'name', label: 'Name' },
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
  // TODO: Subset of currentOutfits/outfitSearchResults containing the first page
  // (20 results). Next 20 are added when you scroll to bottom.
  displayedOutfits: [],
  // Currently selected faction for outfit view
  outfitFaction: { value: 'Human', label: 'Human' },
  // Currently selected category for outfit view
  outiftCategory: { value: '', label: 'All Categories' },
  // Currently selected sort type for outfit view
  outfitSortType: { value: 'name', label: 'Name' },
  // Current search query for outfit view
  outfitSearchQuery: '',

  // All builds for the selected release
  allBuilds: [],
  // Currently selected hull for the build
  currentHull: {},
  // Default build for current hull
  defaultBuild: {},
  // User build, initially based on default buiild
  currentBuild: {},
  // Is the build view in edit mode?
  editMode: false,
  // Has the current build been modified by the user
  userBuild: false,
  // Collection of aggregate stats calculated from
  // current hull and outfits
  buildAggregates: {},
}

export default initialState