import React, { useContext, useEffect, useRef } from 'react'
import { DispatchContext, StateContext } from '../App'
import { addOutfit, removeOutfit, stripe } from '../Utils'
import BuildList from './BuildList'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretRight, faFloppyDisk, faMinus, faPlus,  faTrashCan } from '@fortawesome/free-solid-svg-icons'

import ReactTooltip from 'react-tooltip'

const BuildDetails = () => {
  const dispatch = useContext(DispatchContext)
  const state = useContext(StateContext)

  /**
   * Update local storage when saved hull builds change
   */
  useEffect(() => {
    state.savedHullBuilds.length > 0 ? localStorage.setItem(state.currentHull.id, JSON.stringify(state.savedHullBuilds)) : localStorage.removeItem(state.currentHull.id)
  }, [state.savedHullBuilds])

  /**
   * Stripe table and update tooltips when list of outfits changes
   */
  useEffect(() => {
    const table = document.getElementById("buildOutfits")
    stripe(table)
    ReactTooltip.rebuild()
  }, [state.currentBuild.outfits])

  /**
   * Tries to add the outfit to the current build. Renders
   * an error (to console atm) if outfit cannot be added,
   * sets new outfits otherwise.
   * 
   * @param {Event} e Event triggering the add event
   * @param {Outfit object} outfit Outfit to add to the build
   * @returns Nothing at the moment
   */
  const handleAddOutfit = (e, outfit) => {
    const result = addOutfit(e, outfit, state.currentBuild)
    if (typeof result === 'string') {
      console.log(result)
      return
    }
    else {
      dispatch({ type: 'setBuildOutfits', payload: result})
    }
  }

  const handleRemoveOutfit = (e, outfit) => {
    const result = removeOutfit(e, outfit, state.currentBuild)
    if (typeof result === 'string') {
      console.log(result)
      return
    }
    else {
      dispatch({ type: 'setBuildOutfits', payload: result})
    }
  }
  
  return (
    <div>
      <BuildList />
      <div className="p-1 select-none">
        <h3 className="text-xl font-medium mb-1 pl-3">Current Build</h3>
        <div className="border-2 border-gray-200 rounded-lg p-2">
          <input 
            id="buildTitle" 
            type="text" 
            className="
            w-full
            text-base leading-4 font-medium
            bg-transparent
            border-2 border-gray-500 rounded
            focus:border-gray-400 focus:ring-1 focus:ring-gray-400
            px-2 mb-1" 
            value={state.currentBuild.name ? state.currentBuild.name : ""}
            onChange={e => dispatch({ type: 'setBuildName', payload: e.target.value })}/>

          <table 
            id="buildOutfits"
            className="mb-2 w-full">
            <tbody>
              <tr className="nostripe font-bold">
                <td></td>
                <td></td>
                <td colSpan={2} className="text-center">{state.multi ? <span> &times; {state.multi}</span> : <span className="opacity-0">&times; 1</span>}</td>
              </tr>
              {
                state.currentBuild.outfits && 
                (
                  state.currentBuild.outfits.length > 0 ?
                  state.currentBuild.outfits.map((outfit_set) => 
                  <tr key={outfit_set.outfit.id}>
                    <td>{outfit_set.outfit.name}</td>
                    <td className="pl-3 w-16">&times; {outfit_set.amount}</td>
                    <td className="text-lg leading-none text-lime-600 hover:text-lime-500 cursor-pointer pl-3"
                      data-tip="Add"
                      onClick={e => handleAddOutfit(e, outfit_set.outfit)}>
                      <FontAwesomeIcon icon={faPlus} />
                    </td>
                    <td className="text-lg leading-none text-red-600 hover:text-red-500 cursor-pointer pl-2"
                      data-tip="Remove"
                      onClick={e => handleRemoveOutfit(e, outfit_set.outfit)}>
                      <FontAwesomeIcon icon={faMinus} />
                    </td>
                  </tr>
                  ) :
                  <tr><td>No outfits yet</td></tr>
                  )
                  
                }
            </tbody>
          </table>

          <div className="w-full grid grid-cols-3 gap-1">
            <button
              data-tip="Save"
              className="border border-gray-300 rounded
                brightness-90 hover:brightness-125
                p-2"
              onClick={() => dispatch({ type: 'saveBuild' })}
              ><FontAwesomeIcon icon={faFloppyDisk}/>
            </button>
            <button
              data-tip="Save as"
              className="border border-gray-300 rounded
              brightness-90 hover:brightness-125 hover:bg-gray-600
              p-2"
              onClick={() => dispatch({ type: 'saveNewBuild' }) }
              ><FontAwesomeIcon icon={faFloppyDisk}/>
              <FontAwesomeIcon className="px-1" icon={faCaretRight}/>
              <FontAwesomeIcon icon={faFloppyDisk}/>
            </button>
            <button
              data-tip="Clear"
              className="border border-gray-300 rounded
              brightness-90 hover:brightness-125 hover:bg-gray-600
              p-2"
              onClick={() => dispatch({ type: 'clearBuild' })}
              ><FontAwesomeIcon icon={faTrashCan}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuildDetails
