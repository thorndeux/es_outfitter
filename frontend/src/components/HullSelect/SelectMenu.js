import React, { useContext } from 'react'
import AsyncSelect from 'react-select/async'
import Select from 'react-select'

import { DispatchContext, StateContext } from '../App'

const SelectMenu = () => {
  const state = useContext(StateContext)
  const dispatch = useContext(DispatchContext)

  // Handles release select
  const getReleases = async () => {
    const res = await fetch("http://localhost:8000/api/releases")
    const data = await res.json()
    return(data.Releases)
  }
  
  const defaultRelease = { value: '0.9.14', label: '0.9.14' }

  const changeRelease = e => {
    dispatch({ type: 'filterRelease', payload: e })
  }

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
    dispatch({ type: 'filterHullFaction', payload: e })
  }

  // Handles spoiler select
  const spoilerOptions = [
    { value: '0', label: 'No Spoilers' },
    { value: '1', label: 'Minimal Spoilers' },
    { value: '2', label: 'Moderate Spoilers' },
    { value: '3', label: 'All Spoilers' },
  ]
  const changeSpoiler = e => {
    dispatch({ type: 'filterSpoiler', payload: e})
  }

  // Handles category select
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { label: 'Warships',
      options: [
        { value: 'Interceptor', label: 'Interceptor' },
        { value: 'Light Warship', label: 'Light Warship' },
        { value: 'Medium Warship', label: 'Medium Warship' },
        { value: 'Heavy Warship', label: 'Heavy Warship' },
      ]
    },
    { label: 'Support',
      options: [
        { value: 'Fighter', label: 'Fighter' },
        { value: 'Drone', label: 'Drone' },
      ]
    },
    { label: 'Freighters',
      options: [
        { value: 'Light Freighter', label: 'Light Freighter' },
        { value: 'Heavy Freighter', label: 'Heavy Freighter' },
      ]
    },
    { label: 'Transport',
      options: [
        {value: 'Transport', label: 'Transport' },
      ]
    }
  ]
  const changeCategory = e => {
    dispatch({ type: 'filterHullCategory', payload: e})
  }

  // Handles sorting select
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'cost', label: 'Cost' },
    { value: 'shields', label: 'Shields' },
    { value: 'hull', label: 'Hull' },
    { value: 'totalHP', label: 'Hull + Shields'},
    { value: 'outfit_space', label: 'Outfit space' },
    { value: 'engine_capacity', label: 'Engine capacity' },
    { value: 'weapon_capacity', label: 'Weapon capacity' },
    { value: 'cargo_space', label: 'Cargo space' },
    { value: 'bunks', label: 'Bunks' },
    { value: 'max_guns', label: 'Gun slots' },
    { value: 'max_turrets', label: 'Turret slots' },
    { value: 'max_fighters', label: 'Fighter bays' },
    { value: 'max_drones', label: 'Drone bays' },
  ]

  const defaultSortType = { value: 'name', label: 'Name' }

  const changeSortType = e => {
    dispatch({ type: 'sortHulls', payload: e })
  }

  // Handles search box
  const filterHulls = e => {
    dispatch({ type: 'searchHulls', payload: e.target.value })
  }
  
  return (
    <div className="
      lg:col-span-1 w-full self-start 
      grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 
      gap-1 lg:gap-2 
      text-gray-900 bg-gray-700 
      p-2 rounded 
      sticky top-0 z-10"
    >
      <div>
        <label htmlFor="releaseSelect" className="text-gray-300 pl-1 hidden sm:block">Select release</label>
        <AsyncSelect
          id="releaseSelect"
          cacheOptions
          loadOptions={getReleases}
          value={state.release}
          defaultOptions
          onChange={changeRelease}
        />
      </div>
      <div>
        <label htmlFor="spoilerSelect" className="text-gray-300 pl-1 hidden sm:block">Select spoiler level</label>
        <Select
          id="spoilerSelect"
          options={spoilerOptions}
          value={state.spoiler}
          onChange={changeSpoiler}
        />
      </div>
      <div>
        <label htmlFor="factionSelect" className="text-gray-300 pl-1 hidden sm:block">Select faction</label>
        <Select
          id="factionSelect"
          options={factionOptions}
          value={state.hullFaction}
          onChange={changeFaction}
          isDisabled={state.spoiler.value < 2}
        />
      </div>
      <div>
        <label htmlFor="categorySelect" className="text-gray-300 pl-1 hidden sm:block">Select category</label>
        <Select
          id="categorySelect"
          options={categoryOptions}
          value={state.hullCategory}
          onChange={changeCategory}
        />
      </div>
      <div>
        <label htmlFor="sortSelect" className="text-gray-300 pl-1 hidden sm:block">Sort by</label>
        <Select
          id="sortSelect"
          options={sortOptions}
          value={state.hullSortType}
          onChange={changeSortType}
        />
      </div>
      <div>
        <label htmlFor="searchHulls" className="text-gray-300 pl-1 hidden sm:block">Search hulls</label>
        <input
          type="text" id="searchHulls"
          className="rounded w-full py-1.5 px-2.5 text-gray-900" 
          placeholder="Search hulls"
          onChange={filterHulls} />
      </div>
    </div>
  )
}

export default SelectMenu
