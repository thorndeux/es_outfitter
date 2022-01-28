import React, { useEffect, useReducer } from 'react';
import ReactDOM from 'react-dom';

import ReactTooltip from 'react-tooltip';

import HullSelect from './HullSelect/HullSelect';
import ScrollToTop from './ScrollToTop';
import ShipBuilder from './ShipBuilder/ShipBuilder';
import reducer from './Reducers';
import initialState from './Store';

export const StateContext = React.createContext()
export const DispatchContext = React.createContext()

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Load all hulls for default release on page load
  useEffect(() => {
    const getHulls = async () => {
      const hullsFromServer = await fetchHulls()
      dispatch({ type: 'getHulls', payload: hullsFromServer })
    }

    getHulls()
  }, [state.release])

  /**
   * Rebuild tooltips whenever view changes
   */
  useEffect(() => {
    ReactTooltip.rebuild()
    console.log("Tooltips rebuilt");
  }, [state.hullSelect, state.shipBuilder])

  // Fetch hulls
  const fetchHulls = async () => {

    const params = {
      "release": state.release.value,
    };
    const url = new URL("http://localhost:8000/api/hulls")
    for (let k in params) { 
      if (params[k]) {
        url.searchParams.append(k, params[k])
      }
    }
    let res
    try {
      res = await fetch(url)
    } catch (e) {
      console.log("Could not fetch hulls for release '" + state.release.value + "':", e)
    }
    const data = await res.json()

    return data
  }

  // Load all outfits for default release on page load
  useEffect(() => {
    const getOutfits = async () => {
      const outfitsFromServer = await fetchOutfits()
      dispatch({ type: 'getOutfits', payload: outfitsFromServer })
    }

    getOutfits()
  }, [state.release])


  // Fetch outifts
  const fetchOutfits = async () => {

    const params = {
      "release": state.release.value,
    };
    const url = new URL("http://localhost:8000/api/outfits")
    for (let k in params) { 
      if (params[k]) {
        url.searchParams.append(k, params[k])
      }
    }
    let res
    try {
      res = await fetch(url)
    } catch (e) {
      console.log("Could not fetch outfits for release '" + state.release.value + "':", e)
    }
    const data = await res.json()

    return data
  }

  // Load all builds for default release on page load
  useEffect(() => {
    const getBuilds = async () => {
      const buildsFromServer = await fetchBuilds()
      dispatch({ type: 'getBuilds', payload: buildsFromServer })
    }

    getBuilds()
  }, [state.release])


  // Fetch builds
  const fetchBuilds = async () => {

    const params = {
      "release": state.release.value,
    };
    const url = new URL("http://localhost:8000/api/builds")
    for (let k in params) { 
      if (params[k]) {
        url.searchParams.append(k, params[k])
      }
    }
    let res
    try {
      res = await fetch(url)
    } catch (e) {
      console.error("Could not fetch builds for release '" + state.release.value + "':", e)
    }
    const data = await res.json()

    return data
  }

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>
        <div className="relative bg-gray-300 text-gray-200 min-h-screen font-sans">
          <ReactTooltip
            effect="solid"
            delayShow={150}
            className="text-gray-200"
            html={true}
          />          
          {state.hullSelect && <HullSelect />}
          {state.shipBuilder && <ShipBuilder />}
          <ScrollToTop />
        </div>
      </StateContext.Provider>  
    </DispatchContext.Provider>
  )
}

export default App;

ReactDOM.render(<App />, document.getElementById('app'))