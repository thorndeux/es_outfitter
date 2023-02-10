import React, { useContext, useEffect } from "react"
import { useParams } from "react-router-dom"
import { isEmpty } from "lodash"

import BuildWindow from "./BuildWindow/BuildWindow"
import OutfitSelect from "./OutfitSelect/OutfitSelect"
import OutfitList from "./OutfitList/OutfitList"

import { DispatchContext, StateContext } from "../App"

const ShipBuilder = () => {
  const dispatch = useContext(DispatchContext)
  const state = useContext(StateContext)

  const { build } = useParams()
  const hull = state.allHulls.find((hull) => hull.id === JSON.parse(build).hull)

  useEffect(() => {
    console.log(build)
    console.log(hull)
    isEmpty(state.currentHull) &&
      dispatch({ type: "shipBuilder", payload: hull })
  }, [])

  /**
   * Adds event listener to track whether the
   * Shift, Ctrl, and Alt keys are currently
   * being held down
   */
  useEffect(() => {
    window.addEventListener("keydown", downHandler)
    window.addEventListener("keyup", upHandler)

    return () => {
      window.removeEventListener("keydown", downHandler)
      window.removeEventListener("keyup", upHandler)
    }
  }, [])

  /**
   * Updates multiplier string when modifier key
   * state changes
   */
  useEffect(() => {
    let multi = 1
    state.shiftHeld && (multi *= 5)
    state.ctrlHeld && (multi *= 20)
    state.rightAltHeld && (multi = "max")
    dispatch({ type: "setMulti", payload: multi === 1 ? "" : String(multi) })
  }, [state.shiftHeld, state.ctrlHeld, state.rightAltHeld])

  /**
   * Toggles tracker variables to true when respective
   * key is pressed
   *
   * @param {Key} key Key triggering the event
   */
  const downHandler = ({ key }) => {
    key === "Shift" && dispatch({ type: "setShiftHeld", payload: true })
    key === "Control" && dispatch({ type: "setCtrlHeld", payload: true })
    key === "AltGraph" && dispatch({ type: "setRightAltHeld", payload: true })
  }

  /**
   * Toggles tracker variables to false when respective
   * key is no longer pressed
   *
   * @param {Key} key Key triggering the event
   */
  const upHandler = ({ key }) => {
    key === "Shift" && dispatch({ type: "setShiftHeld", payload: false })
    key === "Control" && dispatch({ type: "setCtrlHeld", payload: false })
    key === "AltGraph" && dispatch({ type: "setRightAltHeld", payload: false })
  }

  return (
    <>
      <div
        className="
      container mx-auto
      grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 
      content-start
      bg-gray-600"
      >
        {state.shipBuilder && (
          <>
            <BuildWindow />
            <OutfitSelect />
            <OutfitList />
          </>
        )}
      </div>
    </>
  )
}

export default ShipBuilder
