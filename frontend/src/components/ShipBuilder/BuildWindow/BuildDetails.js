import React, { useContext, useEffect } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import toast from "react-hot-toast"

import {
  FaCaretRight,
  FaSave,
  FaMinus,
  FaPlus,
  FaTrashAlt,
} from "react-icons/fa"

import { DispatchContext, StateContext } from "../../App"
import { addOutfit, removeOutfit } from "../../../util/build"
import stripeTable from "../../../util/stripeTable"

import BuildList from "./BuildList"
import OutfitTooltip from "../OutfitList/OutfitTooltip"

const BuildDetails = () => {
  const dispatch = useContext(DispatchContext)
  const state = useContext(StateContext)

  /**
   * Update local storage when saved hull builds change
   */
  useEffect(() => {
    state.savedHullBuilds.length > 0
      ? localStorage.setItem(
          state.currentHull.id,
          JSON.stringify(state.savedHullBuilds)
        )
      : localStorage.removeItem(state.currentHull.id)
  }, [state.savedHullBuilds])

  /**
   * Stripe table and update tooltips when list of outfits changes
   */
  useEffect(() => {
    const table = document.getElementById("buildOutfits")
    stripeTable(table)
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
    if (typeof result.attribute === "string") {
      toast.error(
        <div>
          <p>
            Not enough{" "}
            <span className="font-bold">
              {result.attribute.replaceAll("_", " ")}
            </span>{" "}
            to add <span className="font-bold">{outfit.name}</span>.
          </p>
          <p className="pt-2">
            Required:{" "}
            <span className="font-bold text-blue-400">
              {Math.abs(outfit[result.attribute])}
            </span>{" "}
            - Remaining:{" "}
            <span className="font-bold text-red-500">{result.remaining}</span>
          </p>
        </div>
      )
    } else {
      dispatch({ type: "setBuildOutfits", payload: result.outfits })
      // toast.success(<p>Added <span className="font-bold">{result.amount}</span> &times; <span className="font-bold">{outfit.name}</span>!</p>)
    }
  }

  const handleRemoveOutfit = (e, outfit) => {
    const result = removeOutfit(e, outfit, state.currentBuild)
    if (typeof result.attribute === "string") {
      toast.error(
        <div>
          <p>
            Not enough{" "}
            <span className="font-bold">
              {result.attribute.replaceAll("_", " ")}
            </span>{" "}
            to remove <span className="font-bold">{outfit.name}</span>.
          </p>
          <p className="pt-2">
            Required:{" "}
            <span className="font-bold text-blue-400">
              {Math.abs(outfit[result.attribute])}
            </span>{" "}
            - Remaining:{" "}
            <span className="font-bold text-red-500">{result.remaining}</span>
          </p>
        </div>
      )
    } else {
      dispatch({ type: "setBuildOutfits", payload: result.outfits })
      // toast.success(<p>Removed <span className="font-bold">{result.amount}</span> &times; <span className="font-bold">{outfit.name}</span>!</p>)
    }
  }

  return (
    <div className="select-none sm:px-1">
      <BuildList />
      <div className="border-2 border-gray-200 text-gray-200 rounded-lg px-2 py-1 mt-1">
        <h3 className="text-xl font-medium mb-2 pl-1">Current Build</h3>
        <input
          id="buildTitle"
          type="text"
          className="
          w-full
          text-base leading-4 font-medium
          bg-transparent
          border-2 border-gray-500 rounded
          focus:border-gray-400 focus:ring-1 focus:ring-gray-400
          px-2"
          value={state.currentBuild.name ? state.currentBuild.name : ""}
          onChange={(e) =>
            dispatch({ type: "setBuildName", payload: e.target.value })
          }
        />

        <table id="buildOutfits" className="mb-2 w-full">
          <tbody>
            <tr className="nostripe font-bold">
              <td></td>
              <td></td>
              <td colSpan={2} className="text-center">
                {state.multi ? (
                  <span> &times; {state.multi}</span>
                ) : (
                  <span className="opacity-0">&times; 1</span>
                )}
              </td>
            </tr>
            {state.currentBuild.outfits &&
              (state.currentBuild.outfits.length > 0 ? (
                state.currentBuild.outfits.map((outfit_set) => (
                  <tr key={outfit_set.outfit.id}>
                    <td>
                      <span
                        data-tooltip-content={renderToStaticMarkup(
                          <OutfitTooltip
                            key={outfit_set.outfit.id}
                            state={state}
                            outfit={outfit_set.outfit}
                          />
                        )}
                      >
                        {outfit_set.outfit.name}
                      </span>
                    </td>
                    <td className="pl-3 w-16">&times; {outfit_set.amount}</td>
                    <td
                      className="text-lg text-lime-600 hover:text-lime-500 cursor-pointer pl-3"
                      data-tooltip-content="Add"
                      data-place="bottom"
                      onClick={(e) => handleAddOutfit(e, outfit_set.outfit)}
                    >
                      <FaPlus />
                    </td>
                    <td
                      className="text-lg text-red-600 hover:text-red-500 cursor-pointer pl-2 pr-1"
                      data-tooltip-content="Remove"
                      data-place="bottom"
                      onClick={(e) => handleRemoveOutfit(e, outfit_set.outfit)}
                    >
                      <FaMinus />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>No outfits yet</td>
                </tr>
              ))}
          </tbody>
        </table>

        <div className="w-full grid grid-cols-3 gap-1 mb-1">
          <button
            data-tooltip-content="Save"
            className="border border-gray-300 rounded
              brightness-90 hover:brightness-125
              p-2"
            onClick={() => dispatch({ type: "saveBuild" })}
          >
            <FaSave className="inline" />
          </button>
          <button
            data-tooltip-content="Save as"
            className="border border-gray-300 rounded
            brightness-90 hover:brightness-125 hover:bg-gray-600
            p-2"
            onClick={() => dispatch({ type: "saveNewBuild" })}
          >
            <FaSave className="inline" />
            <FaCaretRight className="inline" />
            <FaSave className="inline" />
          </button>
          <button
            data-tooltip-content="Clear"
            className="border border-gray-300 rounded
            brightness-90 hover:brightness-125 hover:bg-gray-600
            p-2"
            onClick={() => dispatch({ type: "clearBuild" })}
          >
            <FaTrashAlt className="inline" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default BuildDetails
