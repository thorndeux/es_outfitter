import React, { useContext, useEffect } from 'react'
import { DispatchContext, StateContext } from '../App'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudArrowDown, faCopy, faTrashCan } from '@fortawesome/free-solid-svg-icons'

import ReactTooltip from 'react-tooltip'

import { stripe } from '../Utils'

const BuildList = () => {
  const state = useContext(StateContext)
  const dispatch = useContext(DispatchContext)

  useEffect(() => {
    dispatch({ type: 'setHullBuilds' })

    const json = localStorage.getItem(state.currentHull.id)
    const savedHullBuilds = JSON.parse(json)
    savedHullBuilds && dispatch({ type: 'setSavedHullBuilds', payload: savedHullBuilds })


    return () => { 
      dispatch({ type: 'setSavedHullBuilds', payload: [] })
      dispatch({ type: 'setHullBuilds', payload: [] })
    }
  }, [])

  useEffect(() => {
    ReactTooltip.rebuild()
  }, [state.hullBuilds, state.savedHullBuilds])

  useEffect(() => {
    const table = document.getElementById("hullBuilds")
    stripe(table)
  }, [state.hullBuilds])

  useEffect(() => {
    const table = document.getElementById("savedHullBuilds")
    stripe(table)
  }, [state.savedHullBuilds])

  return (
    <div className="p-1 select-none">
      <h3 className="text-xl font-medium mb-1 pl-3">Available Builds</h3>
      <div className="border-2 border-gray-200 text-gray-200 rounded-lg px-2 py-1">
        <h2 className="font-medium">In-game Builds</h2>
        <table id="hullBuilds" className="w-full leading-snug mb-2">
          <tbody>
            { state.hullBuilds.length > 0 &&
              state.hullBuilds.map((build) => 
              <tr key={build.id}>
                <td onDoubleClick={() => dispatch({ type:'cloneBuild', payload: build })}>
                  {build.name}
                </td>
                <td
                  data-tip="Clone"
                  onClick={() => dispatch({ type:'cloneBuild', payload: build })} 
                  className="w-6 hover:cursor-pointer brightness-90 hover:brightness-110">
                    <FontAwesomeIcon icon={faCopy} />
                </td>
              </tr>
              )
            }
          </tbody>
        </table>
        <h2 className="font-medium">Your Builds</h2>
        <table id="savedHullBuilds" className="w-full leading-snug">
          <tbody>
            { state.savedHullBuilds.length > 0 &&
              state.savedHullBuilds.map((build) => 
              <tr key={build.id}>
                <td
                  onDoubleClick={() => dispatch({ type:'loadBuild', payload: build })} 
                  >{build.name}</td>
                <td
                  data-tip="Delete build"
                  onClick={() => dispatch({ type:'deleteBuild', payload: build }, ReactTooltip.hide())} 
                  className="w-6 hover:cursor-pointer brightness-90 hover:brightness-110">
                  <FontAwesomeIcon icon={faTrashCan} />
                </td>
                <td
                  data-tip="Load build"
                  onClick={() => dispatch({ type:'loadBuild', payload: build })} 
                  className="w-6 hover:cursor-pointer brightness-90 hover:brightness-110">
                  <FontAwesomeIcon icon={faCloudArrowDown} />
                </td>
              </tr>
              )
            }
          </tbody>
        </table>
        { state.savedHullBuilds.length === 0 &&
          <p className="bg-gray-500">No saved builds yet</p>
        }
      </div>
    </div>
  )
}

export default BuildList
