import { cloneDeep } from "lodash"
import { sortByFields } from "../util/sorting"

const reducer = (state, action) => {
  /**
   * Replace hull and outfit IDs with respective objects
   *
   * @param {Build} build Django Build model instance to be parsed
   * @returns Parsed build
   */
  const parseBuild = (build) => {
    // Replace hull ID with hull object
    build.hull = state.allHulls.find((hull) => hull.id === build.hull)
    // Make a copy of all outfit sets (consisting of amount and outfit id)
    const outfit_sets = [...build.outfits]
    // Loop over copy
    for (const outfit_set of outfit_sets) {
      // Find the right outfit
      const outfit = state.allOutfits.find(
        (outfit) => outfit.id === outfit_set.outfit
      )
      // Remove first outfit_set from original outfit sets
      const old_set = build.outfits.shift()
      // Make a new outfit_set containing the outfit object
      const new_set = {
        amount: old_set.amount,
        outfit: outfit,
      }
      // Add it to the end of original outfit sets
      build.outfits.push(new_set)
    }
    return build
  }

  switch (action.type) {
    case "hullSelect":
      return {
        ...state,
        hullSelect: true,
        shipBuilder: false,
        currentHull: [],
        defaultBuild: {},
        currentBuild: {},
        hullSearchQuery: "",
      }
    case "getHulls":
      return { ...state, allHulls: action.payload }
    case "filterHulls":
      return { ...state, currentHulls: action.payload }
    case "filterRelease":
      return {
        ...state,
        release: action.payload,
        outfitSort: "name",
        hullSort: "name",
      }
    case "filterSpoiler":
      return {
        ...state,
        spoiler: action.payload,
        hullFaction:
          Number(action.payload.value) < 2
            ? { value: "Human", label: "Human" }
            : { value: "", label: "All Factions" },

        outfitFaction:
          Number(action.payload.value) < 2
            ? { value: "Human", label: "Human" }
            : { value: "", label: "All Factions" },
      }
    case "filterHullFaction":
      return { ...state, hullFaction: action.payload }
    case "filterHullCategory":
      return { ...state, hullCategory: action.payload }
    case "toggleListDetail":
      return {
        ...state,
        detailedList: !state.detailedList,
        pageSize: state.detailedList
          ? state.largePageSize
          : state.smallPageSize,
      }
    case "sortHulls": {
      // Determine which selection to sort (current hulls or search results)
      var relevantSelection = state.hullSearchQuery
        ? cloneDeep(state.hullSearchResults)
        : cloneDeep(state.currentHulls)
      // Reverse hulls if the sort attribute is unchanged
      const sortAttribute = action.payload
      if (sortAttribute == state.hullSort) {
        relevantSelection = relevantSelection.reverse()
      }
      // Else, sort by new attribute
      else {
        if (
          ["cost", "drag", "name", "mass", "required_crew"].includes(
            sortAttribute
          )
        ) {
          relevantSelection = relevantSelection.sort(
            sortByFields([sortAttribute])
          )
        } else {
          relevantSelection = relevantSelection.sort(
            sortByFields(["-" + sortAttribute])
          )
        }
      }
      // Update sorted hulls and sort attribute
      return state.hullSearchQuery
        ? {
            ...state,
            hullSearchResults: relevantSelection,
            hullSort: sortAttribute,
          }
        : {
            ...state,
            currentHulls: relevantSelection,
            hullSort: sortAttribute,
          }
    }
    case "searchHulls":
      return { ...state, hullSearchQuery: action.payload }
    case "showHullSearch":
      return { ...state, hullSearchResults: action.payload }
    case "updateDisplayedHulls": {
      const start = state.displayedHulls.length
      const relevantSelection = state.hullSearchQuery
        ? state.hullSearchResults
        : state.currentHulls
      const end =
        relevantSelection.length >= start + state.pageSize
          ? start + state.pageSize
          : relevantSelection.length
      const addedHulls = relevantSelection.slice(start, end)
      const newDisplayedHulls = state.displayedHulls.concat(addedHulls)
      return { ...state, displayedHulls: newDisplayedHulls }
    }
    case "resetDisplayedHulls":
      return { ...state, displayedHulls: [] }

    case "shipBuilder":
      return {
        ...state,
        hullSelect: false,
        shipBuilder: true,
        currentHull: action.payload,
        outfitCategory: { value: "", label: "All Categories" },
        outfitSearchQuery: "",
        outfitSort: "name",
      }
    case "getOutfits":
      return { ...state, allOutfits: action.payload }
    case "filterOutfits":
      return { ...state, currentOutfits: action.payload }
    case "filterOutfitFaction":
      return { ...state, outfitFaction: action.payload }
    case "filterOutfitCategory":
      return { ...state, outfitCategory: action.payload }
    case "sortOutfits": {
      // Determine which selection to sort (current outfits or search results)
      var relevantSelection = state.outfitSearchQuery
        ? cloneDeep(state.outfitSearchResults)
        : cloneDeep(state.currentOutfits)
      // Reverse outfits if the sort attribute is unchanged
      const sortAttribute = action.payload
      if (sortAttribute == state.outfitSort) {
        relevantSelection = relevantSelection.reverse()
      }
      // Else, sort by new attribute
      else {
        if (
          [
            "cost",
            "energy_per_second",
            "firing_energy",
            "firing_heat",
            "heat_generation",
            "heat_per_second",
            "inaccuracy",
            "name",
            "mass",
            "reload_time",
            "thrusting_energy",
            "thrusting_heat",
            "turning_energy",
            "turning_heat",
          ].includes(sortAttribute)
        ) {
          relevantSelection = relevantSelection.sort(
            sortByFields([sortAttribute])
          )
        } else {
          relevantSelection = relevantSelection.sort(
            sortByFields(["-" + sortAttribute])
          )
        }
      }
      // Update sorted outfits and sort attribute
      return state.outfitSearchQuery
        ? {
            ...state,
            outfitSearchResults: relevantSelection,
            outfitSort: sortAttribute,
          }
        : {
            ...state,
            currentOutfits: relevantSelection,
            outfitSort: sortAttribute,
          }
    }
    case "searchOutfits":
      return { ...state, outfitSearchQuery: action.payload }
    case "showOutfitSearch":
      return { ...state, outfitSearchResults: action.payload }
    case "updateDisplayedOutfits": {
      const start = state.displayedOutfits.length
      const relevantSelection = state.outfitSearchQuery
        ? state.outfitSearchResults
        : state.currentOutfits
      const end =
        relevantSelection.length >= start + state.pageSize
          ? start + state.pageSize
          : relevantSelection.length
      const addedOutfits = relevantSelection.slice(start, end)
      const newDisplayedOutfits = state.displayedOutfits.concat(addedOutfits)
      return { ...state, displayedOutfits: newDisplayedOutfits }
    }
    case "resetDisplayedOutfits":
      return { ...state, displayedOutfits: [] }
    case "getBuilds":
      return { ...state, allBuilds: action.payload }
    case "setDefaultBuild": {
      const build = state.allBuilds.find(
        (build) => build.id === state.currentHull.default_build
      )
      const parsedBuild = parseBuild(cloneDeep(build))

      const currentBuild = {
        ...parsedBuild,
        id: Date.now(),
        name: `${parsedBuild.name} (Copy)`,
      }

      return {
        ...state,
        currentBuild: currentBuild,
        defaultBuild: parsedBuild,
      }
    }
    case "resetDefaultBuild":
      return { ...state, defaultBuild: {} }
    case "setHullBuilds": {
      const hullBuilds = state.allBuilds.filter(
        (build) => build.hull === state.currentHull.id
      )
      const parsedHullBuilds = hullBuilds.map((build) =>
        parseBuild(cloneDeep(build))
      )
      return { ...state, hullBuilds: parsedHullBuilds }
    }
    case "setSavedHullBuilds":
      return { ...state, savedHullBuilds: action.payload }
    case "setCurrentBuild":
      return { ...state, currentBuild: action.payload }
    case "setBuildName":
      return {
        ...state,
        currentBuild: { ...state.currentBuild, name: action.payload },
      }
    case "saveBuild": {
      const newSavedHullBuilds = cloneDeep(state.savedHullBuilds)
      const buildIndex = newSavedHullBuilds.findIndex(
        (build) => build.id === state.currentBuild.id
      )
      if (buildIndex === -1) {
        newSavedHullBuilds.push(state.currentBuild)
      } else {
        newSavedHullBuilds[buildIndex] = state.currentBuild
      }
      return { ...state, savedHullBuilds: newSavedHullBuilds }
    }
    case "saveNewBuild": {
      const newCurrent = { ...state.currentBuild, id: Date.now() }
      const newSavedHullBuilds = [...state.savedHullBuilds, newCurrent]

      return {
        ...state,
        currentBuild: newCurrent,
        savedHullBuilds: newSavedHullBuilds,
      }
    }
    case "loadBuild":
      return { ...state, currentBuild: action.payload }
    case "cloneBuild": {
      const clonedBuild = {
        ...action.payload,
        id: Date.now(),
        name: `${action.payload.name} (Copy)`,
      }
      return { ...state, currentBuild: clonedBuild }
    }
    case "deleteBuild": {
      var newSavedHullBuilds = cloneDeep(state.savedHullBuilds)
      newSavedHullBuilds.splice(
        state.savedHullBuilds.indexOf(action.payload),
        1
      )
      return { ...state, savedHullBuilds: newSavedHullBuilds }
    }
    case "clearBuild":
      return { ...state, currentBuild: { ...state.currentBuild, outfits: [] } }
    case "setBuildOutfits":
      return {
        ...state,
        currentBuild: { ...state.currentBuild, outfits: action.payload },
      }
    case "setShiftHeld":
      return { ...state, shiftHeld: action.payload }
    case "setCtrlHeld":
      return { ...state, ctrlHeld: action.payload }
    case "setRightAltHeld":
      return { ...state, rightAltHeld: action.payload }
    case "setMulti":
      return { ...state, multi: action.payload }

    case "setDefenseAggregates":
      return { ...state, defenseAggregates: action.payload }
    case "setMobilityAggregates":
      return { ...state, mobilityAggregates: action.payload }
    case "setMissionsAggregates":
      return { ...state, missionsAggregates: action.payload }
    case "setSpaceAggregates":
      return { ...state, spaceAggregates: action.payload }
    case "setHeatAggregates":
      return { ...state, heatAggregates: action.payload }
    case "setEnergyAggregates":
      return { ...state, energyAggregates: action.payload }
    case "setOffenseAggregates":
      return { ...state, offenseAggregates: action.payload }

    default:
      return state
  }
}

export default reducer
