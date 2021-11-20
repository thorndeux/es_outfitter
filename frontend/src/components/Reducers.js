const reducer = (state, action) => {
  switch (action.type) {
    case 'hullSelect':
      return { ...state,
        hullSelect: true,
        shipBuilder: false,
        currentHull: [],
        defaultBuild: {},
        currentBuild: {},
      }
    case 'getHulls': 
      return { ...state, allHulls: action.payload }
    case 'filterHulls':
      return { ...state, currentHulls: action.payload }
    case 'filterRelease':
      return { ...state, release: action.payload }
    case 'filterSpoiler':
      return { ...state,
        spoiler: action.payload,
        hullFaction: Number(action.payload.value) < 2 ? { value: 'Human', label: 'Human' } : { value: '', label: 'All Factions' },

        outfitFaction: Number(action.payload.value) < 2 ? { value: 'Human', label: 'Human' } : { value: '', label: 'All Factions' },

      } 
    case 'filterHullFaction':
      return { ...state, hullFaction: action.payload }
    case 'filterHullCategory':
      return { ...state, hullCategory: action.payload }
    case 'sortHulls':
      return { ...state, hullSortType: action.payload }
    case 'searchHulls':
      return { ...state, hullSearchQuery: action.payload }
    case 'showHullSearch':
      return { ...state, hullSearchResults: action.payload }

    case 'shipBuilder':
      return { ...state,
        hullSelect: false,
        shipBuilder: true,
        currentHull: action.payload,
        outfitFaction: { value: 'Human', label: 'Human' },
        outfitCategory: { value: '', label: 'All Categories' },
        outfitSortType: { value: 'name', label: 'Name' },
        outfitSearchQuery: '',
      }
    case 'getOutfits':
      return { ...state, allOutfits: action.payload }
    case 'filterOutfits':
      return { ...state, currentOutfits: action.payload }
    case 'filterOutfitFaction':
      return { ...state, outfitFaction: action.payload }
    case 'filterOutfitCategory':
      return { ...state, outfitCategory: action.payload }
    case 'sortOutfits':
      return { ...state, outfitSortType: action.payload }
    case 'searchOutfits':
      return { ...state, outfitSearchQuery: action.payload }
    case 'showOutfitSearch':
      return { ...state, outfitSearchResults: action.payload }
    case 'getBuilds':
      return { ...state, allBuilds: action.payload }
    case 'setDefaultBuild':
      return { ...state, defaultBuild: action.payload }
    case 'toggleEdit':
      return { ...state, editMode: action.payload }
    case 'setCurrentBuild':
      return { ...state, currentBuild: action.payload }
    case 'setBuildName':
      return { ...state, currentBuild: { ...state.currentBuild, name: action.payload } }
    case 'clearBuild':
      return { ...state, currentBuild: { ...state.currentBuild, outfits: [], name: `New ${state.currentHull.name} build` } }
    case 'setBuildOutfits':
      return { ...state, currentBuild: { ...state.currentBuild, outfits: action.payload }}
    default:
      return state
  }  
}

export default reducer

