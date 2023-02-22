import React, { useContext, useEffect } from "react"
import { TooltipWrapper } from "react-tooltip"
import { useNavigate } from "react-router-dom"

import { DispatchContext, StateContext } from "../../App"
import FieldProp from "../../shared/FieldProp"
import stripeTable from "../../../util/stripeTable"

const HullCard = ({ hull }) => {
  const state = useContext(StateContext)
  const dispatch = useContext(DispatchContext)

  useEffect(() => {
    const table = document.getElementById(hull.id)
    stripeTable(table)
  }, [state.displayedHulls])

  // Fields to exclude from list of attributes
  const excludedAttributes = [
    "id",
    "spoiler",
    "name",
    "release",
    "plural",
    "thumbnail",
    "sprite",
    "description",
    "default_build",
    "base_model",
  ]

  const navigate = useNavigate()

  const loadShipBuilder = (hull) => {
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
    const build = state.allBuilds.find(
      (build) => build.id === hull.default_build
    )
    navigate(`/builder/${JSON.stringify(build)}`)
  }

  return (
    <div
      className="
      flex-grow
      flex flex-col justify-between
      text-gray-200
      bg-gradient-to-br from-gray-600 to-gray-500 
      border border-gray-400 rounded-sm 
      w-full sm:w-96 h-auto
      text-base
      p-2
      filter hover:brightness-110"
    >
      <div className="mb-1">
        <h2>
          <TooltipWrapper>
            <span
              className="text-xl font-medium hover:cursor-pointer"
              onClick={() => dispatch({ type: "sortHulls", payload: "name" })}
              data-tooltip-content="Sort by name"
            >
              {hull.name}
            </span>
          </TooltipWrapper>
          <button
            className="
              float-right
              p-1 px-2 rounded shadow
              text-base text-gray-900 bg-blue-400
              hover:shadow-lg
              hover:text-gray-800 hover:bg-blue-300
              hover:cursor-pointer"
            onClick={() => loadShipBuilder(hull)}
          >
            Start build
          </button>
        </h2>
      </div>
      <p className="text-justify">{hull.description}</p>
      <div>
        <img
          className="m-auto max-h-64 drop-shadow-xl py-5"
          src={`/static/${hull.sprite}`}
          alt={hull.name}
        />
      </div>
      <div>
        <h3 className="text-lg font-medium">Base Stats</h3>
        <table id={hull.id} className="w-full">
          <tbody>
            {Object.keys(hull).map((attribute) => {
              if (
                hull[attribute] &&
                Number(hull[attribute]) != 0 &&
                !excludedAttributes.includes(attribute) &&
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

export default HullCard
