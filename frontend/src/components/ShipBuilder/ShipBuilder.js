import React, { useContext, useEffect } from 'react'

import BuildWindow from './BuildWindow'
import OutfitSelect from './OutfitSelect'
import OutfitList from './OutfitList'
import OutfitCard from './OutfitCard'

import { DispatchContext, StateContext } from '../App'

const ShipBuilder = () => {
  const dispatch = useContext(DispatchContext);
  const state = useContext(StateContext);

  /**
   * Adds event listener to track whether the
   * Shift, Ctrl, and Alt keys are currently 
   * being held down
   */
  useEffect(() => {
    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)
  
    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    };
  }, []);

  /**
   * Updates multiplier string when modifier key
   * state changes
   */
  useEffect(() => {
    let multi = 1
    state.shiftHeld && (multi *= 5)
    state.ctrlHeld && (multi *= 20)
    state.rightAltHeld && (multi = 'max')
    dispatch({ type: 'setMulti', payload: multi === 1 ? '' : String(multi) })
    
  }, [state.shiftHeld, state.ctrlHeld, state.rightAltHeld]);
  

  /**
   * Toggles tracker variables to true when respective
   * key is pressed
   * 
   * @param {Key} key Key triggering the event
   */
  const downHandler = ({key}) => {
    key === 'Shift' && dispatch({ type: 'setShiftHeld', payload: true })
    key === 'Control' && dispatch({ type: 'setCtrlHeld', payload: true })
    key === 'AltGraph' && dispatch({ type: 'setRightAltHeld', payload: true })
  }

  /**
   * Toggles tracker variables to false when respective
   * key is no longer pressed
   * 
   * @param {Key} key Key triggering the event
   */
  const upHandler = ({key}) => {
    key === 'Shift' && dispatch({ type: 'setShiftHeld', payload: false })
    key === 'Control' && dispatch({ type: 'setCtrlHeld', payload: false })
    key === 'AltGraph' && dispatch({ type: 'setRightAltHeld', payload: false })
  }

  
  return (
    <>
    <div className="
      container mx-auto
      grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 
      content-start
      bg-gray-600"
    >
      <BuildWindow />
      <OutfitSelect />
      <OutfitList />
    </div>
    </>
  )
}

export default ShipBuilder
