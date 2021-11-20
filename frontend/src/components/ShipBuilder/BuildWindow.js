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

  // Fetch hull default build
  const fetchDefaultBuild = async () => {
    if (state.currentHull) {
      let res
      try {
        res = await fetch("http://localhost:8000/api/builds/" + state.currentHull.default_build)
      } catch (e) {
        console.log("Could not fetch default build for hull '" + state.currentHull.name + "':", e)
      }
      const data = await res.json()
      return data
    }
  }

  // Get default build from state.allBuilds
  const getDefaultBuild =  () => {
    state.allBuilds.forEach(build => {
      build.id === state.currentHull.default_build && dispatch({ type: 'setDefaultBuild', payload: build })
    });
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
