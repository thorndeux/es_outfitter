import React, { useContext, useEffect } from 'react'

import { DispatchContext, StateContext } from '../App'

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
    for (const build of state.allBuilds) {
      if (build.id === state.currentHull.default_build) {
        dispatch({ type: 'setDefaultBuild', payload: parseBuild(build) })
        break
      }
    }
  }

  // Replace outfit IDs with outfit objects
  const parseBuild = (build) => {
    // Make a copy of all outfit sets (consisting of amount and outfit id)
    const outfit_sets = [...build.outfits]
    // Loop over copy
    for (const outfit_set of outfit_sets) {
      // Find the right outfit
      for (const outfit of state.allOutfits) {
        if (outfit.id === outfit_set.outfit) {
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
      }
    }
    return build
  }

  // Make sure build window has enough height to accomodate the hull sprite, even before the build has fully loaded
  const setMinimumHeight = () => {

    let image_height = document.getElementById("currentHullSprite").height
    document.getElementById("buildContainer").style.minHeight = `${image_height + 30}px`

  }
  // Info that needs to be here:
    // Hull icon
    // Build list
    // Aggregate stats:
      // Max Speed
      // Acceleration
      // Turn
      // Mass
      // Required Crew ?
      // Bunks
      // Cargo Space

      // Outfit Space     total - remaining
      // Engine Capacity  total - remaining
      // Weapon Capacity  total - remaining
      // Hardpoints       total - remaining

      // Heat balance
      // Energy balance
      // Fuel stuff
      
      // DPS stats
      // Anti-missile


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
        <div className="
          lg:col-span-2 
          p-2">
          <h3 className="text-lg mb-1">{state.defaultBuild.name}</h3>
          <table>
            <tbody>
              {
                state.defaultBuild.outfits && 
                state.defaultBuild.outfits.map((outfit) => 
                  <tr key={outfit.outfit.id}>
                    <td>{outfit.outfit.name}</td>
                    <td className="pl-5">&times; {outfit.amount}</td>
                  </tr>
                )
                
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default BuildWindow
