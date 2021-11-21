import React, { useContext } from 'react'
import { DispatchContext, StateContext } from '../App'

const BuildDetails = () => {
  const dispatch = useContext(DispatchContext)
  const state = useContext(StateContext)

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
    <>    
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
    </>
  )
}

export default BuildDetails
