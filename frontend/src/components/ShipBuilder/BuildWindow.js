import React, { useContext, useEffect } from 'react'

import { DispatchContext, StateContext } from '../App'
import BuildAggregates from './BuildAggregates'
import BuildDetails from './BuildDetails'
import AggregatesTable from './AggregatesTable'

const BuildWindow = () => {
  const state = useContext(StateContext)
  const dispatch = useContext(DispatchContext)

  
  // Load default build for currentHull and set it as current build
  useEffect(() => {
    dispatch({ type: 'setDefaultBuild' })
    setMinimumHeight()

    return () => {
      dispatch({ type: 'resetDefaultBuild' })  
      dispatch({ type: 'setCurrentBuild', payload: {} })
    }
  }, [state.currentHull, state.allBuilds])


  /**
   * Make sure build window has enough height to accomodate the hull sprite,
   * even before the build has fully loaded
   */
  const setMinimumHeight = () => {
    let image_height = document.getElementById("currentHullSprite").height
    document.getElementById("spriteContainer").style.minHeight = `${Math.max(360, image_height + 30)}px`
  }

  const defenseData = {
    id: 'defenseAggregates',
    title: 'Defense',
    labels: null,
    rows: [
      {
        key: 'Hull',
        keytip: 'The...hull? What did you expect?',
        values: [state.defenseAggregates.hull],
        valuetips: [state.defenseAggregates.hull_contributers],
      },
      {
        key: 'Shields',
        keytip: 'How much shields your ship has',
        values: [state.defenseAggregates.shields],
      },
      {
        key: 'Hull regen',
        keytip: 'Total amount of hull repaired per second',
        values: [state.defenseAggregates.hull_regen],
        hideEmpty: true,
      },
      {
        key: 'Shield regen',
        keytip: 'Total shield regeneration per second',
        values: [state.defenseAggregates.shield_regen],
        hideEmpty: true,
      },
      {
        key: 'Anti-missile DPS',
        keytip: <div className="text-justify">
          <p className="font-medium">Total amount of anti-missile damage per second</p>
          <p>Note that this is only a ballpark measure of your build's anti-missile capabilities, due to how the game determines whether an anti-missile shot is a hit or not:</p>
          <p>For each shot it rolls an x-sided die, where x is the 'anti-missile' value of the turret, and a y-sided die, where y is the missile's 'missile strength'. If the anti-missile roll is greater than the missile roll, the missile will be destroyed. Otherwise, no damage is dealt to it.</p>
        </div>,
        values: [state.defenseAggregates.anti_missile_dps],
        valuetips: [state.defenseAggregates.anti_missile_dps_contributers],
        hideEmpty: true,
      },
    ]
  }

  const mobilityData = {
    id: 'mobilityAggregates',
    title: 'Mobility',
    labels: ['Cargo', 'No cargo'],
    rows: [
      {
        key: 'Max speed',
        values: ['', state.mobilityAggregates.max_speed],
      },
      {
        key: 'Acceleration',
        values: [
          state.mobilityAggregates.acceleration_with_cargo,
          state.mobilityAggregates.acceleration_no_cargo
        ],
      },
      {
        key: 'Turn',
        values: [
          state.mobilityAggregates.turn_with_cargo,
          state.mobilityAggregates.turn_no_cargo
        ],
      },
      {
        key: 'Mass',
        values: [
          state.mobilityAggregates.mass_with_cargo,
          state.mobilityAggregates.mass_no_cargo
        ],
      },
      {
        key: 'Fuel capacity',
        values: ['', state.mobilityAggregates.fuel_capacity],
      },
      {
        key: 'Jump cost',
        values: ['', state.mobilityAggregates.jump_fuel],
      },
      {
        key: 'Fuel used while firing',
        values: ['', state.mobilityAggregates.firing_fuel],
        hideEmpty: true,
      },
      {
        key: 'Ramscoop',
        values: ['', state.mobilityAggregates.ramscoop],
        hideEmpty: true,
      },
    ]
  }

  const missionData = {
    id: 'missionsAggregates',
    title: 'Cargo and Crew',
    labels: null,
    rows: [
      {
        key: 'Cargo space',
        values: [state.missionsAggregates.cargo_space],
      },
      {
        key: 'Required crew',
        values: [state.missionsAggregates.required_crew],
      },
      {
        key: 'Bunks',
        values: [state.missionsAggregates.bunks],
      },
    ]
  }

  return (
    <div className="lg:col-span-4 xl:col-span-5 p-2">
      <div>
        <button className="mb-2"
        onClick={() => dispatch({ type:'hullSelect' })}>
          &lt; Back to hull selection
        </button>
      </div>
      <div id="buildContainer" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
        bg-gradient-to-br from-gray-600 to-gray-500 
        border border-gray-400 rounded-sm p-1 pb-2">
        <div className="select-none sm:px-1 flex flex-col">
          <div id="spriteContainer" className="grow relative p-2 mt-1 border-2 rounded-lg">
            <div className="absolute inset-0 flex">
              <img
                id="currentHullSprite"
                className="m-auto max-h-72 xs:max-h-96 p-2"
                src={`/static/${state.currentHull.sprite}`}
                alt={state.currentHull.name}
                data-tip={
                  `<p class="font-bold">${state.currentHull.name}</p>
                  <p>${state.currentHull.description}</p>`
                }
                data-class="max-w-prose"
                data-arrow-color="transparent"
              />
            </div>
          </div>
          <AggregatesTable data={defenseData} />
          <AggregatesTable data={mobilityData} /> 
          <AggregatesTable data={missionData} />
        </div>
        <BuildAggregates />
        <BuildDetails />
      </div>
    </div>
  )
}

export default BuildWindow
