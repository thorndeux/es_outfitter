import React, { useContext, useEffect } from 'react'

import { DispatchContext, StateContext } from '../App'
import HullCard from './HullCard'

const HullList = () => {
  const state = useContext(StateContext)
  const dispatch = useContext(DispatchContext)
    
  // Run filterHulls() whenever allHulls, spoiler, faction, or category changes
  useEffect(() => {
    filterHulls()
  }, [state.allHulls, state.spoiler, state.hullFaction, state.hullCategory, state.hullSortType])
  
  // Filter and sort hulls based on selection
  const filterHulls = () => {
    let filteredHulls = state.allHulls.filter(hull => hull.spoiler <= Number(state.spoiler.value))
    state.hullFaction.value && (filteredHulls = filteredHulls.filter(hull => hull.faction === state.hullFaction.value))
    state.hullCategory.value ? (filteredHulls = filteredHulls.filter(hull => hull.category === state.hullCategory.value)) : filteredHulls = filteredHulls.filter(hull => hull.category)    

    if (['cost', 'name'].includes(state.hullSortType.value)) {
      filteredHulls = filteredHulls.sort(fieldSorter([state.hullSortType.value, 'name']))
    }
    else if (['totalHP'].includes(state.hullSortType.value)) {
      filteredHulls = filteredHulls.sort(sortByFieldSum(['hull', 'shields'], 'desc'))
    }
    else {
      filteredHulls = filteredHulls.sort(fieldSorter(['-' + state.hullSortType.value, 'name']))
    }

    dispatch({ type: 'filterHulls', payload: filteredHulls })

  }
 
  /**
   * Utility function from Stackoverflow to sort by multiple fields
   * where the fields array contains the field names. If a name is
   * prepended with a '-', sort direction is reversed for that field.
   * 
   * @param {Array} fields  Array containing the names of fields to sort by
   * @returns               Sort instruction (1, -1, or 0, depending on case)
   */
  const fieldSorter = (fields) => (a, b) => fields.map(o => {
    let dir = 1;
    if (o[0] === '-') { dir = -1; o=o.substring(1); }
    return a[o] > b[o] ? dir : a[o] < b[o] ? -(dir) : 0;
  }).reduce((p, n) => p ? p : n, 0);

  /**
   * Sorts by the sum of an array of fields, second, optional argument
   * is the sort direction ('desc' for descending)
   * 
   * @param {Array} fields      Array of fields to sum up for each object
   * @param {String} direction  (optional) Reverse sort direction for 'desc' 
   * @returns                   Sort instruction (1, -1, or 0, depending on case)
   */
  const sortByFieldSum = (fields, direction='asc') => (a, b) => {
    let dir = 1
    direction === 'desc' && (dir = -1)
    const fieldSum = (o, fields) => fields.reduce((p, n) => (o[p] ? Number(o[p]) : 0) + (o[n] ? Number(o[n]) : 0))
    return fieldSum(a, fields) > fieldSum(b, fields) ? dir : fieldSum(a, fields) < fieldSum(b, fields) ? -(dir) : 0
  }

  // Runs search function when user types in the searchbox
  useEffect(() => {
    searchHullsBy()
  }, [state.hullSearchQuery, state.currentHulls])

  // Filters hulls by search query
  const searchHullsBy = () => {
    let filteredHulls = [...state.currentHulls]
    if (state.hullSearchQuery) {
      filteredHulls = [...state.currentHulls].filter(hull => hull.name.toLowerCase().includes(state.hullSearchQuery.toLowerCase()))
    }
    
    dispatch({ type: 'showHullSearch', payload: filteredHulls })
  }
  
  return (
    <div className="
      lg:col-span-3 xl:col-span-4 
      flex flex-wrap 
      gap-2 p-2"
    >
      {
        state.hullSearchQuery 
        ? (state.hullSearchResults.length!=0
          ? state.hullSearchResults.map((hull) => (
            <HullCard key={hull.id} hull={hull} />
          ))
          : <p>There are no hulls for this search term</p>) 
        : (state.currentHulls.length!=0
          ? state.currentHulls.map((hull) => (
            <HullCard key={hull.id} hull={hull} />
          )) 
          : <p>There are no hulls for this selection</p>)
      }
    </div>
  )
}

export default HullList
