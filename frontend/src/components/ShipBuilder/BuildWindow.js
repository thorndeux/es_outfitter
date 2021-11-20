import React, { useContext, useEffect } from 'react'
import _ from 'lodash'

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

  const modifyBuild = () => {
    dispatch({ type: 'toggleEdit', payload: state.editMode ? false : true })
    dispatch({ type: 'setBuildName', payload: `New ${state.currentHull.name} build` })
    // add 'add' button to all OutfitCards
  }

  const clearBuild = () => {
    dispatch({ type: 'toggleEdit', payload:  true })
    dispatch({ type: 'clearBuild' })
  }

  const loadDefault = () => {
    dispatch({ type: 'setCurrentBuild', payload: _.cloneDeep(state.defaultBuild) })
    state.editMode && dispatch({ type: 'setBuildName', payload: `New ${state.currentHull.name} build` })

  }

  const setName = e => {
    dispatch({ type: 'setBuildName', payload: e.target.value })
  }

  const addOutfit = (outfit, amount, inBuild) => {
    // Validation logic goes here:
        // Outfit space
        // Engine space
        // Weapon space
        // Cargo space
        // Gun ports
        // Turret slots
        // Fighter bays
        // Drone bays
        // Spinal mount
    
    // If validation succeeds, determine new outfits
    const newOutfits = _.cloneDeep(state.currentBuild.outfits)
    if (inBuild) {
      const outfit_set = newOutfits.find(outfit_set => outfit_set.outfit.id === outfit.id)
      outfit_set.amount += amount
      dispatch({ type: 'setBuildOutfits', payload: newOutfits})
    }
    else {
      const outfit_set = { "amount": amount, "outfit": outfit }
      newOutfits.push(outfit_set)
      dispatch({ type: 'setBuildOutfits', payload: newOutfits})
    }
    // Implement ordering of outfits
  }

  const removeOutfit = (id, amount) => {

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
        <div className="lg:col-span-2 p-2">
          {
            !state.editMode ? 
            <h3 className="text-xl font-medium mb-1">{state.currentBuild.name}</h3> : 
            <input 
              id="buildTitle" 
              type="text" 
              className="
                text-xl leading-7 font-medium
                bg-transparent
                border-1 border-yellow-500 rounded
                focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400  
                px-3 mb-1" 
              value={state.currentBuild.name}
              onChange={e => dispatch({ type: 'setBuildName', payload: e.target.value })}/>

          }
          <table className="mb-4">
            <tbody>
              {
                state.currentBuild.outfits && 
                (
                  state.currentBuild.outfits.length > 0 ?
                  state.currentBuild.outfits.map((outfit_set) => 
                  <tr key={outfit_set.outfit.id}>
                    <td>{outfit_set.outfit.name}</td>
                    <td className="pl-5">&times; {outfit_set.amount}</td>
                    {state.editMode &&
                    <>
                    <td className="text-3xl text-lime-600 leading-4 font-semibold cursor-pointer pl-4" onClick={() => addOutfit(outfit_set.outfit, 1, true)}>+</td>
                    <td className="text-3xl text-red-600 leading-4 font-semibold cursor-pointer pl-3" onClick={() => removeOutfit(outfit_set.outfit, 1, true)}>-</td>
                    </>
                    }
                  </tr>
                  ) :
                  <tr><td>No outfits yet</td></tr>
                )
                
              }
            </tbody>
          </table>
          <div className="w-64 grid grid-cols-2 gap-1">
            <button
              className="border border-gray-300 bg-gray-700 rounded p-2"
              onClick={modifyBuild}
            >Modify</button>
            <button
              className="border border-gray-300 bg-gray-700 rounded p-2"
              onClick={clearBuild}
            >Clear</button>
            <button
              className="col-span-2 border border-gray-300 bg-gray-700 rounded p-2"
              onClick={loadDefault}
            >Load default build</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuildWindow
