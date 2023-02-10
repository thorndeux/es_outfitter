import React, { useContext, useEffect } from "react"

import { DispatchContext, StateContext } from "../../App"
import { sortByFields, sortByFieldSum } from "../../../util/sorting"
import HullCard from "./HullCard"

import ReactTooltip from "react-tooltip"
import HullCardCompact from "./HullCardCompact"

const HullList = () => {
  const state = useContext(StateContext)
  const dispatch = useContext(DispatchContext)

  /**
   * Rebuild tooltips whenever displayed hulls change
   */
  useEffect(() => {
    ReactTooltip.rebuild()
  }, [state.displayedHulls, state.detailedList])

  // Run filterHulls() whenever allHulls, spoiler, faction, or category changes
  useEffect(() => {
    filterHulls()
  }, [
    state.allHulls,
    state.spoiler,
    state.hullFaction,
    state.hullCategory,
    state.hullSort,
  ])

  // Filter and sort hulls based on selection
  const filterHulls = () => {
    let filteredHulls = state.allHulls.filter(
      (hull) => hull.spoiler <= Number(state.spoiler.value)
    )
    state.hullFaction.value &&
      (filteredHulls = filteredHulls.filter(
        (hull) => hull.faction === state.hullFaction.value
      ))
    state.hullCategory.value
      ? (filteredHulls = filteredHulls.filter(
          (hull) => hull.category === state.hullCategory.value
        ))
      : (filteredHulls = filteredHulls.filter((hull) => hull.category))

    if (["cost", "name"].includes(state.hullSort)) {
      filteredHulls = filteredHulls.sort(sortByFields([state.hullSort, "name"]))
    } else if (["totalHP"].includes(state.hullSort)) {
      filteredHulls = filteredHulls.sort(
        sortByFieldSum(["hull", "shields"], "desc")
      )
    } else {
      filteredHulls = filteredHulls.sort(
        sortByFields(["-" + state.hullSort, "name"])
      )
    }

    dispatch({ type: "filterHulls", payload: filteredHulls })
  }

  // Runs search function when user types in the searchbox
  useEffect(() => {
    searchHullsBy()
  }, [state.hullSearchQuery, state.currentHulls])

  // Filters hulls by search query
  const searchHullsBy = () => {
    let filteredHulls = [...state.currentHulls]
    if (state.hullSearchQuery) {
      filteredHulls = [...state.currentHulls].filter((hull) =>
        hull.name.toLowerCase().includes(state.hullSearchQuery.toLowerCase())
      )
    }

    dispatch({ type: "showHullSearch", payload: filteredHulls })
  }

  // Load first page of hulls on page load and
  // when the relevant hull selection changes
  useEffect(() => {
    dispatch({ type: "resetDisplayedHulls" })
    dispatch({ type: "updateDisplayedHulls" })
  }, [state.currentHulls, state.hullSearchResults, state.hullSelect])

  // Add event listener to update hull list
  useEffect(() => {
    document.addEventListener("scroll", updateHullList, { passive: true })
    return () => {
      window.removeEventListener("scroll", updateHullList)
    }
  }, [])

  // Load another page when the user reaches bottom of window
  const updateHullList = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      dispatch({ type: "updateDisplayedHulls" })
    }
  }

  return (
    <div
      className="
      lg:col-span-3 xl:col-span-4 
      flex flex-wrap 
      gap-2 p-2"
    >
      {state.hullSearchQuery ? (
        state.hullSearchResults.length != 0 ? (
          state.displayedHulls.map((hull) =>
            state.detailedList ? (
              <HullCard key={hull.id} hull={hull} />
            ) : (
              <HullCardCompact key={hull.id} hull={hull} />
            )
          )
        ) : (
          <p>There are no hulls for this search term</p>
        )
      ) : state.currentHulls.length != 0 ? (
        state.displayedHulls.map((hull) =>
          state.detailedList ? (
            <HullCard key={hull.id} hull={hull} />
          ) : (
            <HullCardCompact key={hull.id} hull={hull} />
          )
        )
      ) : (
        <p>There are no hulls for this selection</p>
      )}
    </div>
  )
}

export default HullList
