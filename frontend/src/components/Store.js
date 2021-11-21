const initialState = {
  hullSelect: true,
  allHulls: [],
  currentHulls: [],
  displayedHulls: [],
  hullSearchResults: [],
  release: { value: '0.9.14', label: '0.9.14' },
  spoiler: { value: '0', label: 'No Spoilers' },
  hullFaction: { value: 'Human', label: 'Human' },
  hullCategory: { value: '', label: 'All Categories' },
  hullSearchQuery: '',
  hullSortType: { value: 'name', label: 'Name' },

  shipBuilder: false,
  allOutfits: [],
  currentOutfits: [],
  displayedOutfits: [],
  outfitSearchResults: [],
  outfitFaction: { value: 'Human', label: 'Human' },
  outiftCategory: { value: '', label: 'All Categories' },
  outfitSearchQuery: '',
  outfitSortType: { value: 'name', label: 'Name' },

  allBuilds: [],
  currentHull: {},
  defaultBuild: {},
  currentBuild: {},
  editMode: false,
  buildAggregates: {},
}

export default initialState