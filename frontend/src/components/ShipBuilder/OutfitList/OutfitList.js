import React, { useContext, useEffect } from "react"

import { StateContext, DispatchContext } from "../../App"
import { sortByFields } from "../../../util/sorting"
import OutfitCard from "./OutfitCard"
import OutfitCardCompact from "./OutfitCardCompact"

import ReactTooltip from "react-tooltip"

const OutfitList = () => {
  const state = useContext(StateContext)
  const dispatch = useContext(DispatchContext)

  useEffect(() => {
    ReactTooltip.rebuild()
  }, [state.displayedOutfits, state.detailedList])

  // Run filterOutfits() whenever allOutfits, spoiler, faction, or category changes
  useEffect(() => {
    filterOutfits()
  }, [
    state.allOutfits,
    state.spoiler,
    state.outfitFaction,
    state.outfitCategory,
    state.outfitSortType,
  ])

  // Filter and sort outfits based on selection
  const filterOutfits = () => {
    let filteredOutfits = state.allOutfits.filter(
      (outfit) => outfit.spoiler <= Number(state.spoiler.value)
    )
    state.outfitFaction.value &&
      (filteredOutfits = filteredOutfits.filter(
        (outfit) => outfit.faction === state.outfitFaction.value
      ))
    state.outfitCategory.value
      ? (filteredOutfits = filteredOutfits.filter(
          (outfit) => outfit.category === state.outfitCategory.value
        ))
      : (filteredOutfits = filteredOutfits.filter((outfit) => outfit.category))

    if (["cost", "name"].includes(state.outfitSort)) {
      filteredOutfits = filteredOutfits.sort(
        sortByFields([state.outfitSort, "name"])
      )
    } else {
      filteredOutfits = filteredOutfits.sort(
        sortByFields(["-" + state.outfitSort, "name"])
      )
    }

    dispatch({ type: "filterOutfits", payload: filteredOutfits })
  }

  // Runs search function when user types in the searchbox
  useEffect(() => {
    searchOutfitsBy()
  }, [state.outfitSearchQuery, state.currentOutfits])

  // Filters outfits by search query
  const searchOutfitsBy = () => {
    let searchedOutfits = [...state.currentOutfits]
    if (state.outfitSearchQuery) {
      searchedOutfits = [...state.currentOutfits].filter((outfit) =>
        outfit.name
          .toLowerCase()
          .includes(state.outfitSearchQuery.toLowerCase())
      )
    }

    dispatch({ type: "showOutfitSearch", payload: searchedOutfits })
  }

  // Load first page of outfits on page load and
  // when the relevant outfit selection changes
  useEffect(() => {
    dispatch({ type: "resetDisplayedOutfits" })
    dispatch({ type: "updateDisplayedOutfits" })
  }, [state.currentOutfits, state.outfitSearchResults])

  // Add event listener to load new page
  useEffect(() => {
    document.addEventListener("scroll", updateOutfitList, { passive: true })

    return () => {
      window.removeEventListener("scroll", updateOutfitList)
    }
  }, [])

  // Load another page when the user reaches bottom of window
  const updateOutfitList = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      dispatch({ type: "updateDisplayedOutfits" })
    }
  }

  return (
    <div
      className="
      lg:col-span-3 xl:col-span-4 
      flex flex-wrap 
      gap-2 p-2 pt-0"
    >
      {state.outfitSearchQuery ? (
        state.outfitSearchResults.length != 0 ? (
          state.displayedOutfits.map((outfit) =>
            state.detailedList ? (
              <OutfitCard key={outfit.id} outfit={outfit} />
            ) : (
              <OutfitCardCompact key={outfit.id} outfit={outfit} />
            )
          )
        ) : (
          <p>There are no outfits for this search term</p>
        )
      ) : state.currentOutfits.length != 0 ? (
        state.displayedOutfits.map((outfit) =>
          state.detailedList ? (
            <OutfitCard key={outfit.id} outfit={outfit} />
          ) : (
            <OutfitCardCompact key={outfit.id} outfit={outfit} />
          )
        )
      ) : (
        <p>There are no outfits for this selection</p>
      )}
    </div>
  )
}

export default OutfitList
