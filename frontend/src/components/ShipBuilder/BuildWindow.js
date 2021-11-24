import React, { useContext, useEffect } from 'react'
import _ from 'lodash'

import { DispatchContext, StateContext } from '../App'
import BuildAggregates from './BuildAggregates'
import BuildDetails from './BuildDetails'

const BuildWindow = () => {
  const state = useContext(StateContext)
  const dispatch = useContext(DispatchContext)

  
  // Load default build for currentHull
  useEffect(() => {
    const getBuild = () => {
      getDefaultBuild()
      setMinimumHeight()
    }

    getBuild()
  }, [state.currentHull, state.allBuilds])

  // Get default build from state.allBuilds
  const getDefaultBuild = () => {
    const build = state.allBuilds.find(build => build.id === state.currentHull.default_build)
    const parsedBuild = parseBuild(_.cloneDeep(build))
    dispatch({ type: 'setCurrentBuild', payload: parsedBuild })
    dispatch({ type: 'setDefaultBuild', payload: _.cloneDeep(parsedBuild) })
  }

  // Replace hull and outfit IDs with objects
  const parseBuild = (build) => {
    // Replace hull ID with hull object
    build.hull = state.allHulls.find(hull => hull.id === build.hull)
    // Make a copy of all outfit sets (consisting of amount and outfit id)
    const outfit_sets = [...build.outfits]
    // Loop over copy
    for (const outfit_set of outfit_sets) {
      // Find the right outfit
      const outfit = state.allOutfits.find(outfit => outfit.id === outfit_set.outfit)
      // Remove first outfit_set from original outfit sets
      const old_set = build.outfits.shift()
      // Make a new outfit_set containing the outfit object
      const new_set = {
        "amount": old_set.amount,
        "outfit": outfit
        }
      // Add it to the end of original outfit sets
      build.outfits.push(new_set)      
    }
    return build
  }

  // Make sure build window has enough height to accomodate the hull sprite, even before the build has fully loaded
  const setMinimumHeight = () => {
    let image_height = document.getElementById("currentHullSprite").height
    document.getElementById("buildContainer").style.minHeight = `${image_height + 30}px`
  }
  

  return (
    <div className="lg:col-span-4 xl:col-span-5 p-2">
      <div>
        <button className="mb-2"
        onClick={() => dispatch({ type:'hullSelect' })}>
          &lt; Back to hull selection
        </button>
      </div>
      <div id="buildContainer" className="grid grid-cols-1 lg:grid-cols-4
        bg-gradient-to-br from-gray-600 to-gray-500 
        border border-gray-400 rounded-sm gap-2">
        <div className="lg:relative p-2">
          <div className="lg:absolute lg:inset-0 flex">
            <img id="currentHullSprite" className="m-auto max-h-72 xs:max-h-96 p-2" src={`/static/${state.currentHull.sprite}`} alt={state.currentHull.name} />
          </div>
        </div>
        <BuildAggregates />
        <BuildDetails />
      </div>
    </div>
  )
}

export default BuildWindow
