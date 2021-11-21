import React, { useContext, useEffect, useRef } from 'react'
import { DispatchContext, StateContext } from '../App'
import FieldProp from '../FieldProp'

const BuildAggregates = () => {
  const state = useContext(StateContext)
  const dispatch = useContext(DispatchContext)

  const aggregates = useRef({
    mass: 0,
    max_speed: 0,
    acceleration_no_cargo: 0,
    acceleration_with_cargo: 0,
  })

  useEffect(() => {
    !_.isEmpty(state.currentBuild) && (
      calcAggregates(),
      dispatch({ type: 'setBuildAggregates', payload: aggregates.current })
    )
    
  }, [state.currentBuild])
  
  const calcAggregates = () => {
    var emptyMass = parseFloat(state.currentBuild.hull.mass)
    for (const outfit_set of state.currentBuild.outfits) {
      outfit_set.outfit.mass && (emptyMass += (outfit_set.amount * parseFloat(outfit_set.outfit.mass)))
    }
    aggregates.current.mass = emptyMass

    var thrust = 0
    for (const outfit_set of state.currentBuild.outfits) {
      outfit_set.outfit.thrust && (thrust += (outfit_set.amount * parseFloat(outfit_set.outfit.thrust)))
    }
    aggregates.current.max_speed = parseFloat((60 * thrust / parseFloat(state.currentBuild.hull.drag)).toFixed(1))

    aggregates.current.acceleration_no_cargo = parseFloat((3600 * thrust / emptyMass).toFixed(1))

    var cargoSpace = state.currentBuild.hull.cargo_space
    for (const outfit_set of state.currentBuild.outfits) {
      outfit_set.outfit.cargo_space && (cargoSpace += (outfit_set.amount * parseFloat(outfit_set.outfit.cargo_space)))
    }

    const fullMass = emptyMass + cargoSpace

    aggregates.current.acceleration_with_cargo = parseFloat((3600 * thrust / fullMass).toFixed(1))


  }
  
  

  // Info that needs to be here:

    // Aggregate stats:
      // Max Speed
      // Acceleration
      // Turn
      // Mass
      // Required Crew ?
      // Bunks
      // Cargo Space

      // Outfit Space     total - remaining
      // Engine Capacity  total - remaining
      // Weapon Capacity  total - remaining
      // Hardpoints       total - remaining

      // Heat balance
      // Energy balance
      // Fuel stuff
      
      // DPS stats
      // Anti-missile

  return (
    <div className="p-2">
      <h3 className="text-xl font-medium mb-1">Build stats</h3>
      <table>
        <tbody>
          {
            state.buildAggregates && Object.keys(state.buildAggregates).map(attribute => 
              <FieldProp key={attribute} attribute={attribute} value={state.buildAggregates[attribute]}/>)
          }
        </tbody>
      </table>
    </div>
  )
}

export default BuildAggregates
