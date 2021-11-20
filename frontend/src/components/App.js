import React, { useEffect, useReducer } from 'react';
import ReactDOM from 'react-dom';

import HullSelect from './HullSelect/HullSelect';
import ScrollToTop from './ScrollToTop';
import ShipBuilder from './ShipBuilder/ShipBuilder';
import reducer from './Reducers';
import initialState from './Store';


export const StateContext = React.createContext()
export const DispatchContext = React.createContext()

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const {hullSelect, shipBuilder, release} = state

  // Load all hulls for default release on page load
  useEffect(() => {
    const getHulls = async () => {
      const hullsFromServer = await fetchHulls()
      dispatch({ type: 'getHulls', payload: hullsFromServer })
    }

    getHulls()
  }, [release])


  // Fetch hulls
  const fetchHulls = async () => {

    const params = {
      "release": release.value,
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
      console.log("Could not fetch hulls for release '" + release.value + "':", e)
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
  }, [release])


  // Fetch outifts
  const fetchOutfits = async () => {

    const params = {
      "release": release.value,
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
      console.log("Could not fetch outfits for release '" + release.value + "':", e)
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
  }, [release])


  // Fetch builds
  const fetchBuilds = async () => {

    const params = {
      "release": release.value,
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
      console.log("Could not fetch builds for release '" + release.value + "':", e)
    }
    const data = await res.json()

    return data
  }

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>
        <div className="bg-gray-300 min-h-screen font-mono">
          {hullSelect && <HullSelect />}
          {shipBuilder && <ShipBuilder />}
          <ScrollToTop />
        </div>
      </StateContext.Provider>  
    </DispatchContext.Provider>
  )
}

export default App;

ReactDOM.render(<App />, document.getElementById('app'))