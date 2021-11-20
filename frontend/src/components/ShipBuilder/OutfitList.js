import React, { useContext, useEffect } from 'react'

import { StateContext, DispatchContext } from '../App'
import OutfitCard from './OutfitCard'

const OutfitList = () => {
  const state = useContext(StateContext)
  const dispatch = useContext(DispatchContext)

  // Run filterOutfits() whenever allOutfits, spoiler, faction, or category changes
  useEffect(() => {
    filterOutfits()
  }, [state.allOutfits, state.spoiler, state.outfitFaction, state.outfitCategory, state.outfitSortType])
  
  // Filter and sort outfits based on selection
  const filterOutfits = () => {
    let filteredOutfits = state.allOutfits.filter(outfit => outfit.spoiler <= Number(state.spoiler.value))
    state.outfitFaction.value && (filteredOutfits = filteredOutfits.filter(outfit => outfit.faction === state.outfitFaction.value))
    state.outfitCategory.value ? (filteredOutfits = filteredOutfits.filter(outfit => outfit.category === state.outfitCategory.value)) : filteredOutfits = filteredOutfits.filter(outfit => outfit.category)

    if (['cost', 'name'].includes(state.outfitSortType.value)) {
      filteredOutfits = filteredOutfits.sort(fieldSorter([state.outfitSortType.value, 'name']))
    }
    else {
      filteredOutfits = filteredOutfits.sort(fieldSorter(['-' + state.outfitSortType.value, 'name']))
    }

    dispatch({ type: 'filterOutfits', payload: filteredOutfits })

  }
  // Utility function from Stackoverflow to sort by multiple fields
  const fieldSorter = (fields) => (a, b) => fields.map(o => {
    let dir = 1;
    if (o[0] === '-') { dir = -1; o=o.substring(1); }
    return a[o] > b[o] ? dir : a[o] < b[o] ? -(dir) : 0;
  }).reduce((p, n) => p ? p : n, 0);


  // Runs search function when user types in the searchbox
  useEffect(() => {
    searchOutfitsBy()
  }, [state.outfitSearchQuery, state.currentOutfits])

  // Filters outfits by search query
  const searchOutfitsBy = () => {
    let filteredOutfits = [...state.currentOutfits]
    if (state.outfitSearchQuery) {
      filteredOutfits = [...state.currentOutfits].filter(outfit => outfit.name.toLowerCase().includes(state.outfitSearchQuery.toLowerCase()))
    }
    
    dispatch({ type: 'showOutfitSearch', payload: filteredOutfits })
  }

  return (
    <div className="
      lg:col-span-3 xl:col-span-4 
      flex flex-wrap 
      gap-2 p-2 pt-0"
    >
      {
        state.outfitSearchQuery 
        ? (state.outfitSearchResults.length!=0
          ? state.outfitSearchResults.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          ))
          : <p>There are no outfits for this search term</p>) 
        : (state.currentOutfits.length!=0
          ? state.currentOutfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          )) 
          : <p>There are no outfits for this selection</p>)
      }
    </div>
  )
}

export default OutfitList
