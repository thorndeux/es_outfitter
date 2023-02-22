import React, { useContext, useEffect } from "react"
import Tooltip from "react-tooltip"

import { DispatchContext, StateContext } from "../../App"
import FieldProp from "../../shared/FieldProp"
import stripeTable from "../../../util/stripeTable"

const HullCardCompact = ({ hull }) => {
  const state = useContext(StateContext)
  const dispatch = useContext(DispatchContext)

  useEffect(() => {
    const table = document.getElementById(hull.id)
    stripeTable(table)
  }, [state.displayedHulls])

  // Fields to exclude from list of attributes
  const includedAttributes = ["faction", "category", "cost", "hull", "shields"]

  const loadShipBuilder = (hull) => {
    dispatch({ type: "shipBuilder", payload: hull })
    Tooltip.hide()
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
  }

  return (
    <div
      className="
      flex-grow
      flex flex-col justify-between
      text-gray-200
      bg-gradient-to-br from-gray-600 to-gray-500 
      border border-gray-400 rounded-sm 
      w-full xs:w-96 h-auto
      text-base
      p-2
      filter hover:brightness-110"
    >
      <div className="mb-2">
        <h2>
          <span
            className="text-xl font-medium hover:cursor-pointer"
            onClick={() => dispatch({ type: "sortHulls", payload: "name" })}
            data-tooltip-content="Sort by name"
          >
            {hull.name}
          </span>
          <button
            className="
            float-right
            p-1 px-2 rounded shadow
            text-base text-gray-900 bg-blue-400
            hover:shadow-lg
            hover:text-gray-800 hover:bg-blue-300
            hover:cursor-pointer"
            data-arrow-color="transparent"
            onClick={() => loadShipBuilder(hull)}
          >
            Start build
          </button>
        </h2>
      </div>
      <div>
        <table id={hull.id} className="w-full table-fixed">
          <tbody>
            {Object.keys(hull).map((attribute) => {
              if (
                hull[attribute] &&
                Number(hull[attribute]) != 0 &&
                includedAttributes.includes(attribute) &&
                (attribute === "faction"
                  ? state.spoiler.value > 1
                    ? true
                    : false
                  : true)
              ) {
                return (
                  <FieldProp
                    clickHandler={() =>
                      dispatch({ type: "sortHulls", payload: attribute })
                    }
                    key={attribute}
                    attribute={attribute}
                    value={hull[attribute]}
                    data_tip={`Sort by ${attribute}`}
                  />
                )
              }
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default HullCardCompact