import React, { useEffect, useReducer } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router-dom"

import { Tooltip, TooltipProvider } from "react-tooltip"
import "react-tooltip/dist/react-tooltip.css"
import { Toaster } from "react-hot-toast"

import reducer from "../state/Reducers"
import initialState from "../state/Store"

import HullPicker from "./HullPicker/HullPicker"
import ScrollToTop from "./ScrollToTop"
import ShipBuilder from "./ShipBuilder/ShipBuilder"

export const StateContext = React.createContext()
export const DispatchContext = React.createContext()

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Load all hulls for default release on page load
  useEffect(() => {
    const getHulls = async () => {
      const hullsFromServer = await fetchHulls()
      dispatch({ type: "getHulls", payload: hullsFromServer })
    }

    getHulls()
  }, [state.release])

  // Fetch hulls
  const fetchHulls = async () => {
    const params = {
      release: state.release.value,
    }
    const url = new URL(`${window.location.origin}/api/hulls`)
    for (let k in params) {
      if (params[k]) {
        url.searchParams.append(k, params[k])
      }
    }
    let res
    try {
      res = await fetch(url)
    } catch (e) {
      console.log(
        "Could not fetch hulls for release '" + state.release.value + "':",
        e
      )
    }
    const data = await res.json()
    console.log("Fetched hulls...")

    return data
  }

  // Load all outfits for default release on page load
  useEffect(() => {
    const getOutfits = async () => {
      const outfitsFromServer = await fetchOutfits()
      dispatch({ type: "getOutfits", payload: outfitsFromServer })
    }

    getOutfits()
  }, [state.release])

  // Fetch outifts
  const fetchOutfits = async () => {
    const params = {
      release: state.release.value,
    }
    const url = new URL(`${window.location.origin}/api/outfits`)
    for (let k in params) {
      if (params[k]) {
        url.searchParams.append(k, params[k])
      }
    }
    let res
    try {
      res = await fetch(url)
    } catch (e) {
      console.log(
        "Could not fetch outfits for release '" + state.release.value + "':",
        e
      )
    }
    const data = await res.json()

    return data
  }

  // Load all builds for default release on page load
  useEffect(() => {
    const getBuilds = async () => {
      const buildsFromServer = await fetchBuilds()
      dispatch({ type: "getBuilds", payload: buildsFromServer })
    }

    getBuilds()
  }, [state.release])

  // Fetch builds
  const fetchBuilds = async () => {
    const params = {
      release: state.release.value,
    }
    const url = new URL(`${window.location.origin}/api/builds`)
    for (let k in params) {
      if (params[k]) {
        url.searchParams.append(k, params[k])
      }
    }
    let res
    try {
      res = await fetch(url)
    } catch (e) {
      console.error(
        "Could not fetch builds for release '" + state.release.value + "':",
        e
      )
    }
    const data = await res.json()

    return data
  }

  return (
    <BrowserRouter>
      <DispatchContext.Provider value={dispatch}>
        <StateContext.Provider value={state}>
          <TooltipProvider>
            <div className="relative bg-gray-300 text-gray-200 min-h-screen font-sans">
              <Tooltip delayShow={150} className="text-gray-200" />
              <Toaster
                position="top-right"
                toastOptions={{
                  className: "bg-gray-900/90 text-gray-300 text-sm",
                  // error: {
                  //   className: "bg-red-900 border border-red-500 text-red-100",
                  //   icon: <FaExclamation size="2em" className="text-red-500"/>,
                  // }
                }}
              />
              <Routes>
                <Route path="/" element={<HullPicker />} />
                <Route path="/builder/:build" element={<ShipBuilder />} />
              </Routes>
              <ScrollToTop />
            </div>
          </TooltipProvider>
        </StateContext.Provider>
      </DispatchContext.Provider>
    </BrowserRouter>
  )
}

export default App

const root = createRoot(document.getElementById("app"))
root.render(<App />)
