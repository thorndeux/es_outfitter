import React, { useContext, useEffect } from "react"
import ReactTooltip from "react-tooltip"
import { FaCloudDownloadAlt, FaCopy, FaTrashAlt } from "react-icons/fa"

import { DispatchContext, StateContext } from "../../App"
import stripeTable from "../../../util/stripeTable"

const BuildList = () => {
  const state = useContext(StateContext)
  const dispatch = useContext(DispatchContext)

  useEffect(() => {
    dispatch({ type: "setHullBuilds" })

    const json = localStorage.getItem(state.currentHull.id)
    const savedHullBuilds = JSON.parse(json)
    savedHullBuilds &&
      dispatch({ type: "setSavedHullBuilds", payload: savedHullBuilds })

    return () => {
      dispatch({ type: "setSavedHullBuilds", payload: [] })
      dispatch({ type: "setHullBuilds", payload: [] })
    }
  }, [])

  useEffect(() => {
    ReactTooltip.rebuild()
  }, [state.hullBuilds, state.savedHullBuilds])

  useEffect(() => {
    const table = document.getElementById("hullBuilds")
    stripeTable(table)
  }, [state.hullBuilds])

  useEffect(() => {
    const table = document.getElementById("savedHullBuilds")
    stripeTable(table)
  }, [state.savedHullBuilds])

  return (
    <div className="border-2 border-gray-200 text-gray-200 rounded-lg px-2 py-1 mt-1">
      <h3 className="text-xl font-medium mb-1 pl-1">Available Builds</h3>
      <h2 className="font-medium">In-game Builds</h2>
      <table id="hullBuilds" className="w-full mb-2">
        <tbody>
          {state.hullBuilds.length > 0 &&
            state.hullBuilds.map((build) => (
              <tr key={build.id}>
                <td
                  onDoubleClick={() =>
                    dispatch({ type: "cloneBuild", payload: build })
                  }
                >
                  {build.name}
                </td>
                <td
                  data-tip="Clone"
                  onClick={() =>
                    dispatch({ type: "cloneBuild", payload: build })
                  }
                  className="w-6 hover:cursor-pointer brightness-90 hover:brightness-110"
                >
                  <FaCopy />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <h2 className="font-medium">Your Builds</h2>
      <table id="savedHullBuilds" className="w-full leading-snug mb-1">
        <tbody>
          {state.savedHullBuilds.length > 0 &&
            state.savedHullBuilds.map((build) => (
              <tr key={build.id}>
                <td
                  onDoubleClick={() =>
                    dispatch({ type: "loadBuild", payload: build })
                  }
                >
                  {build.name}
                </td>
                <td
                  data-tip="Delete build"
                  onClick={() =>
                    dispatch(
                      { type: "deleteBuild", payload: build },
                      ReactTooltip.hide()
                    )
                  }
                  className="w-6 hover:cursor-pointer brightness-90 hover:brightness-110"
                >
                  <FaTrashAlt />
                </td>
                <td
                  data-tip="Load build"
                  onClick={() =>
                    dispatch({ type: "loadBuild", payload: build })
                  }
                  className="w-6 hover:cursor-pointer brightness-90 hover:brightness-110"
                >
                  <FaCloudDownloadAlt />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {state.savedHullBuilds.length === 0 && (
        <p className="bg-gray-500">No saved builds yet</p>
      )}
    </div>
  )
}

export default BuildList
