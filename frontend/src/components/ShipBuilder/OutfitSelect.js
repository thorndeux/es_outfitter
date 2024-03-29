import React, { useContext } from 'react'
import Select from 'react-select'

import { DispatchContext, StateContext } from '../App'

const OutfitSelect = () => {
  const state = useContext(StateContext)
  const dispatch = useContext(DispatchContext)

  // Handles faction select
  const factionOptions = [
    { value: '', label: 'All Factions' },
    { value: 'Coalition', label: 'Coalition' },
    { value: 'Human', label: 'Human' },
    { value: 'Hai', label: 'Hai' },
    { value: 'Ka\'het', label: 'Ka\'het' },
    { value: 'Korath', label: 'Korath' },
    { value: 'Pug', label: 'Pug' },
    { value: 'Quarg', label: 'Quarg' },
    { value: 'Remnant', label: 'Remnant' },
    { value: 'Sheragi', label: 'Sheragi' },
    { value: 'Wanderer', label: 'Wanderer' },
  ]

  const changeFaction = e => {
    dispatch({ type: 'filterOutfitFaction', payload: e })
  }

  // Handles spoiler select
  const spoilerOptions = [
    { value: '0', label: 'No Spoilers' },
    { value: '1', label: 'Minimal Spoilers' },
    { value: '2', label: 'Moderate Spoilers' },
    { value: '3', label: 'All Spoilers' },
  ]
  const changeSpoiler = e => {
    dispatch({ type: 'filterSpoiler', payload: e })
  }

  // Handles category select
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { label: 'Weaponry',
      options: [
        { value: 'Guns', label: 'Guns' },
        { value: 'Secondary Weapons', label: 'Secondary Weapons' },
        { value: 'Turrets', label: 'Turrets' },
        { value: 'Anti-missile', label: 'Anti-missile' },
        { value: 'Ammunition', label: 'Ammunition' },
        { value: 'Hand to Hand', label: 'Hand to Hand' },
      ]
    },
    { label: 'Power',
      options: [
        { value: 'Generators', label: 'Generators' },
        { value: 'Batteries', label: 'Batteries' },
      ]
    },
    { label: 'Engines',
      options: [
        { value: 'Thruster', label: 'Thrusters' },
        { value: 'Steering', label: 'Steering' },
        { value: 'Hyperdrive', label: 'Hyperdrive' },
      ]
    },
    { label: 'Systems',
      options: [
        { value: 'Cooling', label: 'Cooling' },
        { value: 'Shields', label: 'Shields' },
        { value: 'Systems', label: 'Other' },
      ]
    },
    { value: 'Special', label: 'Special' },
  ]
  const changeCategory = e => {
    dispatch({ type: 'filterOutfitCategory', payload: e })
  }

  // Handles search box
  const filterOutfits = e => {
    dispatch({ type: 'searchOutfits', payload: e.target.value })
  }

  return (
    <div className="
      w-full self-start 
      grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1
      lg:col-span-1 
      gap-1 lg:gap-2 
      text-gray-900 bg-gray-700 
      p-2 rounded 
      sticky top-0 z-10"
    >
      <div>
        <label htmlFor="spoilerSelect" className="text-gray-300 pl-1 hidden sm:block">Select spoiler level</label>
        <Select
          id="spoilerSelect"
          options={spoilerOptions}
          value={state.spoiler}
          onChange={changeSpoiler}
        />
      </div>
      {state.spoiler.value > 1 &&
      <div>
        <label htmlFor="factionSelect" className="text-gray-300 pl-1 hidden sm:block">Select faction</label>
        <Select
          id="factionSelect"
          options={factionOptions}
          value={state.outfitFaction}
          onChange={changeFaction}
        />
      </div>
      }
      <div>
        <label htmlFor="categorySelect" className="text-gray-300 pl-1 hidden sm:block">Select category</label>
        <Select
          id="categorySelect"
          options={categoryOptions}
          value={state.outfitCategory}
          onChange={changeCategory}
        />
      </div>
      {/* <div>
        <label htmlFor="sortSelect" className="text-gray-300 pl-1 hidden sm:block">Sort by</label>
        <Select
          id="sortSelect"
          options={sortOptions}
          value={state.outfitSortType}
          onChange={changeSortType}
        />
      </div> */}
      <div>
        <label htmlFor="searchOutfits" className="text-gray-300 pl-1 hidden sm:block">Search outfits</label>
        <input
          type="text" id="searchOutfits"
          className="rounded w-full py-1.5 px-2.5 text-gray-900" 
          placeholder="Search outfits"
          onChange={filterOutfits} />
      </div>
    </div>
  )
}

export default OutfitSelect
