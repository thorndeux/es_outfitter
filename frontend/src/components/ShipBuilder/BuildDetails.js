import React, { useContext } from 'react'
import { DispatchContext, StateContext } from '../App'

const BuildDetails = () => {
  const dispatch = useContext(DispatchContext)
  const state = useContext(StateContext)

  const modifyBuild = () => {
    !state.userBuild && dispatch({ type: 'setBuildName', payload: `New ${state.currentHull.name} build` })
    !state.userBuild && dispatch({ type: 'startUserBuild' })
    dispatch({ type: 'toggleEdit', payload: true })
  }

  const saveBuild = () => {
    localStorage.setItem(state.currentBuild.id, JSON.stringify(state.currentBuild))
    dispatch({ type: 'toggleEdit', payload: false })
  }

  const clearBuild = () => {
    !state.userBuild && dispatch({ type: 'setBuildName', payload: `New ${state.currentHull.name} build` })
    !state.userBuild && dispatch({ type: 'startUserBuild' })
    dispatch({ type: 'toggleEdit', payload:  true })
    dispatch({ type: 'clearBuild' })
  }

  const loadDefault = () => {
    dispatch({ type: 'setCurrentBuild', payload: _.cloneDeep(state.defaultBuild) })
    state.editMode && dispatch({ type: 'setBuildName', payload: `New ${state.currentHull.name} build` })
    state.userBuild && dispatch({ type: 'resetUserBuild' })
  }

  const loadSaves = () => {

  }

  const addOutfit = (e, outfit) => {
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
    var amount = 1
    e.shiftKey && (amount *= 5)
    e.ctrlKey && (amount *= 20)
    const newOutfits = _.cloneDeep(state.currentBuild.outfits)
    const inBuild = newOutfits.find(outfit_set => outfit_set.outfit.id === outfit.id)
    if (inBuild) {
      inBuild.amount += amount
      dispatch({ type: 'setBuildOutfits', payload: newOutfits})
    }
    else {
      const outfit_set = { "amount": amount, "outfit": outfit }
      newOutfits.push(outfit_set)
      dispatch({ type: 'setBuildOutfits', payload: newOutfits})
    }
    // Implement ordering of outfits
  }

  const removeOutfit = (e, outfit) => {
    // If validation succeeds, determine new outfits
    var amount = 1
    e.shiftKey && (amount *= 5)
    e.ctrlKey && (amount *= 20)
    const newOutfits = _.cloneDeep(state.currentBuild.outfits)
    const outfit_set = newOutfits.find(outfit_set => outfit_set.outfit.id === outfit.id)
    if (outfit_set.amount > amount) {
      outfit_set.amount -= amount
    }
    else {
      // Remove outfit_set
      newOutfits.splice(newOutfits.indexOf(outfit_set), 1)
    }
    dispatch({ type: 'setBuildOutfits', payload: newOutfits})    
  }
  
  const showMulti = (e, show) => {
    
  }

  return (
    <div className="lg:col-span-2 p-2">
      {
        !state.editMode ? 
        <h3 className="text-xl font-medium mb-1">{state.currentBuild.name}</h3> : 
        <input 
          id="buildTitle" 
          type="text" 
          className="
            text-xl leading-3 font-medium
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
                <td className="pl-5 w-16">&times; {outfit_set.amount}</td>
                {state.editMode &&
                <>
                <td className="text-3xl text-lime-600 leading-4 font-semibold cursor-pointer pl-4" 
                  onClick={e => addOutfit(e, outfit_set.outfit)}
                  onMouseOver={e => showMulti(e, true)}
                  onMouseOut={e => showMulti(e, false)}>+</td>
                <td className="text-3xl text-red-600 leading-4 font-semibold cursor-pointer pl-3" 
                  onClick={e => removeOutfit(e, outfit_set.outfit)}>-</td>
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
        { !state.editMode &&
          <button
          className="border border-gray-300 bg-gray-700 rounded p-2 hover:bg-gray-600"
          onClick={modifyBuild}
        >Modify build</button>}
        { state.editMode &&
        <button
          className="border border-gray-300 bg-gray-700 rounded p-2 hover:bg-gray-600"
          onClick={saveBuild}
        >Save build</button>}
        <button
          className="border border-gray-300 bg-gray-700 rounded p-2 hover:bg-gray-600"
          onClick={clearBuild}
        >Clear Outfits</button>
        <button
          className="col-span-2 border border-gray-300 bg-gray-700 rounded p-2 hover:bg-gray-600"
          onClick={loadDefault}
        >Load default build</button>
        <button
          className="col-span-2 border border-gray-300 bg-gray-700 rounded p-2 hover:bg-gray-600"
          onClick={loadSaves}
        >Load saved</button>
      </div>
      <div>Put build choices here
      </div>
    </div>

  )
}

export default BuildDetails
