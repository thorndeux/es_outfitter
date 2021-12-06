import React, { useContext, useEffect, useRef } from 'react'
import { DispatchContext, StateContext } from '../App'
import FieldProp from '../FieldProp'

const BuildAggregates = () => {
  const state = useContext(StateContext)
  const dispatch = useContext(DispatchContext)

  const aggregates = useRef({
    max_speed: 0,
    acceleration_no_cargo: 0,
    acceleration_with_cargo: 0,
    turn_no_cargo: 0,
    turn_with_cargo: 0,
    mass: 0,
    cargo_space: 0,
    required_crew: 0,
    bunks: 0,
    total_outfit_space: 0,
    free_outfit_space: 0,
    total_engine_capacity: 0,
    free_engine_capacity: 0,
    total_weapon_capacity: 0,
    free_weapon_capacity: 0,
  })

  useEffect(() => {
    !_.isEmpty(state.currentBuild) && (
      calcAggregates(),
      dispatch({ type: 'setBuildAggregates', payload: aggregates.current })
    )
    
  }, [state.currentBuild])
  
  const calcAggregates = () => {
    // Calculate mass
    var emptyMass = parseFloat(state.currentBuild.hull.mass)
    for (const outfit_set of state.currentBuild.outfits) {
      outfit_set.outfit.mass && (emptyMass += (outfit_set.amount * parseFloat(outfit_set.outfit.mass)))
    }
    // Save mass to aggregates
    aggregates.current.mass = parseFloat(emptyMass).toFixed(1)

    // Calculate thrust
    var thrust = 0
    for (const outfit_set of state.currentBuild.outfits) {
      outfit_set.outfit.thrust && (thrust += (outfit_set.amount * parseFloat(outfit_set.outfit.thrust)))
    }
    // Calculate max speed and save it to aggregates
    aggregates.current.max_speed = parseFloat((60 * thrust / parseFloat(state.currentBuild.hull.drag)).toFixed(1))
    
    // Calculate cargo space
    var cargoSpace = parseFloat(state.currentBuild.hull.cargo_space) || 0
    for (const outfit_set of state.currentBuild.outfits) {
      outfit_set.outfit.cargo_space && (cargoSpace += (outfit_set.amount * parseFloat(outfit_set.outfit.cargo_space)))
    }    
    // Save cargo space to aggregates
    cargoSpace ? (aggregates.current.cargo_space = parseFloat(cargoSpace).toFixed(1)) : (aggregates.current.cargo_space = 0)
    
    // Calculate full mass
    const fullMass = emptyMass + parseFloat(aggregates.current.cargo_space)

    // Save acceleration with and without cargo to aggregates
    aggregates.current.acceleration_no_cargo = parseFloat((3600 * thrust / emptyMass).toFixed(1))
    aggregates.current.acceleration_with_cargo = parseFloat((3600 * thrust / fullMass).toFixed(1))

    // Calculate turn
    var turn = 0
    for (const outfit_set of state.currentBuild.outfits) {
      outfit_set.outfit.turn && (turn += (outfit_set.amount * parseFloat(outfit_set.outfit.turn)))
    }
    // Save turn with and without cargo to aggregates
    aggregates.current.turn_no_cargo = parseFloat((60 * turn / emptyMass).toFixed(1))
    aggregates.current.turn_with_cargo = parseFloat((60 * turn / fullMass).toFixed(1))

    // Calculate required crew and save it to aggregates
    var requiredCrew = parseFloat(state.currentBuild.hull.required_crew)
    for (const outfit_set of state.currentBuild.outfits) {
      outfit_set.outfit.required_crew && (requiredCrew += (outfit_set.amount * parseFloat(outfit_set.outfit.required_crew)))
    }
    aggregates.current.required_crew = requiredCrew

    // Calculate bunks and save it to aggregates
    var bunks = parseFloat(state.currentBuild.hull.bunks)
    for (const outfit_set of state.currentBuild.outfits) {
      outfit_set.outfit.bunks && (bunks += (outfit_set.amount * parseFloat(outfit_set.outfit.bunks)))
    }
    aggregates.current.bunks = bunks

    // Save total outfit space to aggregates
    var outfitSpace = parseFloat(state.currentBuild.hull.outfit_space)
    aggregates.current.total_outfit_space = outfitSpace
    // Calculate remaining outfit space
    for (const outfit_set of state.currentBuild.outfits) {
      outfit_set.outfit.outfit_space && (outfitSpace += (outfit_set.amount * parseFloat(outfit_set.outfit.outfit_space)))
    }    
    aggregates.current.free_outfit_space = outfitSpace

    // Save total outfit space to aggregates
    var engineCapacity = parseFloat(state.currentBuild.hull.engine_capacity)
    aggregates.current.total_engine_capacity = engineCapacity
    // Calculate remaining outfit space
    for (const outfit_set of state.currentBuild.outfits) {
      outfit_set.outfit.engine_capacity && (engineCapacity += (outfit_set.amount * parseFloat(outfit_set.outfit.engine_capacity)))
    }    
    aggregates.current.free_engine_capacity = engineCapacity

    // Save total outfit space to aggregates
    var weaponCapacity = parseFloat(state.currentBuild.hull.weapon_capacity)
    aggregates.current.total_weapon_capacity = weaponCapacity
    // Calculate remaining outfit space
    for (const outfit_set of state.currentBuild.outfits) {
      outfit_set.outfit.weapon_capacity && (weaponCapacity += (outfit_set.amount * parseFloat(outfit_set.outfit.weapon_capacity)))
    }    
    aggregates.current.free_weapon_capacity = weaponCapacity
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
