import React, { useContext, useEffect, useRef } from "react"
import { DispatchContext, StateContext } from "../../App"
import { getAmmoData, getBuildAttribute } from "../../../util/build"
import stripeTable from "../../../util/stripeTable"

import AggregatesTable from "./AggregatesTable"
import AggregatesTooltip from "./AggregatesTooltip"

const BuildAggregates = () => {
  const state = useContext(StateContext)
  const dispatch = useContext(DispatchContext)

  const defense = useRef({
    hull: 0,
    hull_contributers: "",
    shields: 0,
    total_hp: 0,
    hull_regen: 0,
    shield_regen: 0,
    anti_missile_dps: 0,
    anti_missile_dps_contributers: "",
    average_heat: 0,
  })

  const mobility = useRef({
    thrust: 0,
    drag: 0,
    max_speed: 0,
    acceleration_no_cargo: 0,
    acceleration_with_cargo: 0,
    turn: 0,
    turn_no_cargo: 0,
    turn_with_cargo: 0,
    mass_no_cargo: 0,
    mass_with_cargo: 0,
    fuel_capacity: 0,
    jump_fuel: 0,
    ramscoop: 0,
    firing_fuel: 0,
  })

  const missions = useRef({
    cargo_space: 0,
    required_crew: 0,
    bunks: 0,
  })

  const space = useRef({
    total_outfit_space: 0,
    free_outfit_space: 0,
    total_engine_capacity: 0,
    free_engine_capacity: 0,
    total_weapon_capacity: 0,
    free_weapon_capacity: 0,
    total_guns: 0,
    free_guns: 0,
    total_turrets: 0,
    free_turrets: 0,
    total_fighter_bays: 0,
    free_fighter_bays: 0,
    total_drone_bays: 0,
    free_drone_bays: 0,
  })

  const heat = useRef({
    cooling_efficiency: 0,
    cooling: 0,
    active_cooling: 0,
    heat_generation: 0,
    idle_heat: 0,
    idle_heat_level: 0,
    thrusting_heat: 0,
    reverse_thrusting_heat: 0,
    turning_heat: 0,
    afterburner_heat: 0,
    moving_heat: 0,
    firing_heat: 0,
    shield_heat: 0,
    hull_heat: 0,
    action_heat: 0,
    action_heat_level: 0,
    heat_dissipation: 0,
    max_heat: 0,
  })

  const energy = useRef({
    energy_generation: 0,
    solar_collection: 0,
    energy_consumption: 0,
    cooling_energy: 0,
    idle_energy: 0,
    thrusting_energy: 0,
    reverse_thrusting_energy: 0,
    turning_energy: 0,
    afterburner_energy: 0,
    moving_energy: 0,
    firing_energy: 0,
    shield_energy: 0,
    hull_energy: 0,
    action_energy: 0,
    energy_capacity: 0,
  })

  const offense = useRef({
    shield_dps: 0,
    hull_dps: 0,
    average_dps: 0,
    heat_dps: 0,
    ion_dps: 0,
    slowing_dps: 0,
    disruption_dps: 0,
    ammo_capacities: [],
  })

  useEffect(() => {
    !_.isEmpty(state.currentBuild) &&
      (calcAggregates(),
      dispatch({
        type: "setDefenseAggregates",
        payload: { ...defense.current },
      }),
      dispatch({
        type: "setMobilityAggregates",
        payload: { ...mobility.current },
      }),
      dispatch({
        type: "setMissionsAggregates",
        payload: { ...missions.current },
      }),
      dispatch({ type: "setSpaceAggregates", payload: { ...space.current } }),
      dispatch({ type: "setHeatAggregates", payload: { ...heat.current } }),
      dispatch({ type: "setEnergyAggregates", payload: { ...energy.current } }),
      dispatch({
        type: "setOffenseAggregates",
        payload: { ...offense.current },
      }))
  }, [state.currentBuild])

  useEffect(() => {
    const table = document.getElementById("defenseAggregates")
    stripeTable(table)
  }, [state.defenseAggregates])

  useEffect(() => {
    const table = document.getElementById("mobilityAggregates")
    stripeTable(table)
  }, [state.mobilityAggregates])

  useEffect(() => {
    const table = document.getElementById("missionsAggregates")
    stripeTable(table)
  }, [state.missionsAggregates])

  useEffect(() => {
    const table = document.getElementById("spaceAggregates")
    stripeTable(table)
  }, [state.spaceAggregates])

  useEffect(() => {
    const table = document.getElementById("heatAggregates")
    stripeTable(table)
  }, [state.heatAggregates])

  useEffect(() => {
    const table = document.getElementById("energyAggregates")
    stripeTable(table)
  }, [state.energyAggregates])

  useEffect(() => {
    const table = document.getElementById("offenseAggregates")
    stripeTable(table)
  }, [state.offenseAggregates])

  const calcAggregates = () => {
    const build = state.currentBuild
    // Hull and shields
    const hull = (defense.current.hull = getBuildAttribute(build, "hull"))
    const shields = (defense.current.shields = getBuildAttribute(
      build,
      "shields"
    ))
    defense.current.total_hp = hull + shields

    // Hull regen
    defense.current.hull_regen = getBuildAttribute(build, "hull_repair_rate")

    // Shield regen
    defense.current.shield_regen = getBuildAttribute(build, "shield_generation")

    // Anti-missile DPS
    defense.current.anti_missile_dps = getBuildAttribute(
      build,
      "anti_missile_dps"
    )
    defense.current.anti_missile_dps_contributers = build.outfits
      .map((outfit_set) => {
        if (outfit_set.outfit.anti_missile > 0) {
          let tip = ""
          for (let i = 0; i < outfit_set.amount; i++) {
            tip += `<p>${outfit_set.outfit.name}: ${
              outfit_set.outfit.shots_per_second
            } shots/s \u00d7 ${outfit_set.outfit.anti_missile} anti-missile = ${
              outfit_set.outfit.shots_per_second *
              outfit_set.outfit.anti_missile
            }</p>`
          }
          return tip
        }
      })
      .join("")

    // Empty mass
    const emptyMass = (mobility.current.mass_no_cargo = getBuildAttribute(
      build,
      "mass"
    ))

    // Thrust
    const thrust = (mobility.current.thrust = getBuildAttribute(
      build,
      "thrust"
    ))

    // Drag
    const drag = (mobility.current.drag = getBuildAttribute(build, "drag"))

    // Max speed
    mobility.current.max_speed = thrust / (drag * 60)

    // Cargo space
    const cargoSpace = (missions.current.cargo_space = getBuildAttribute(
      build,
      "cargo_space"
    ))

    // Full mass
    const fullMass = (mobility.current.mass_with_cargo = emptyMass + cargoSpace)

    // Acceleration with and without cargo
    mobility.current.acceleration_no_cargo = thrust / emptyMass
    mobility.current.acceleration_with_cargo = thrust / fullMass

    // Turn
    const turn = (mobility.current.turn = getBuildAttribute(build, "turn"))

    // Turn with and without cargo
    mobility.current.turn_no_cargo = turn / emptyMass
    mobility.current.turn_with_cargo = turn / fullMass

    // Fuel capacity
    const fuelCapacity = (mobility.current.fuel_capacity = getBuildAttribute(
      build,
      "fuel_capacity"
    ))

    // Jump fuel
    const jumpFuel = (mobility.current.jump_fuel = build.outfits.reduce(
      (previous, current) => Math.max(previous, current.outfit.jump_fuel),
      0
    ))

    // Firing fuel
    const firingFuel = (mobility.current.firing_fuel = getBuildAttribute(
      build,
      "fuel_per_second"
    ))

    // Ramscoop
    const ramscoop = (mobility.current.ramscoop = getBuildAttribute(
      build,
      "ramscoop"
    ))

    // Required crew
    missions.current.required_crew = getBuildAttribute(build, "required_crew")

    // Bunks
    missions.current.bunks = getBuildAttribute(build, "bunks")

    // Total outfit space (hull + outfit expansions)
    space.current.total_outfit_space = build.outfits.reduce(
      (a, b) =>
        a +
        b.amount *
          ((parseFloat(b.outfit.outfit_space) > 0 &&
            parseFloat(b.outfit.outfit_space)) ||
            0),
      parseFloat(build.hull.outfit_space) || 0
    )
    // Remaining outfit space
    space.current.free_outfit_space = getBuildAttribute(build, "outfit_space")

    // Total engine capacity
    space.current.total_engine_capacity = parseFloat(build.hull.engine_capacity)
    // Remaining engine capacity
    space.current.free_engine_capacity = getBuildAttribute(
      build,
      "engine_capacity"
    )

    // Total weapon capacity
    space.current.total_weapon_capacity = parseFloat(build.hull.weapon_capacity)
    // Remaining weapon capacity
    space.current.free_weapon_capacity = getBuildAttribute(
      build,
      "weapon_capacity"
    )

    // Max gun ports
    space.current.total_guns = build.hull.gun_ports
    // Free gun ports
    space.current.free_guns = getBuildAttribute(build, "gun_ports")

    // Max turret mounts
    space.current.total_turrets = build.hull.turret_mounts
    // Free turret mounts
    space.current.free_turrets = getBuildAttribute(build, "turret_mounts")

    // Max fighter bays
    space.current.total_fighter_bays = build.hull.fighter_bays
    // Free fighter bays
    space.current.free_fighter_bays = getBuildAttribute(build, "fighter_bays")

    // Max drone bays
    space.current.total_drone_bays = build.hull.drone_bays
    // Free drone bays
    space.current.free_drone_bays = getBuildAttribute(build, "drone_bays")

    // Heat info
    // Total cooling inefficiency
    const coolingInefficiency = getBuildAttribute(build, "cooling_inefficiency")
    // Cooling efficiency (multiplier for cooling)
    const coolingEfficiency = (heat.current.cooling_efficiency =
      2 +
      2 / (1 + Math.exp(coolingInefficiency / -2)) -
      4 / (1 + Math.exp(coolingInefficiency / -4)))

    // Cooling
    const cooling = (heat.current.cooling =
      getBuildAttribute(build, "cooling") * coolingEfficiency)
    // Active Cooling
    const activeCooling = (heat.current.active_cooling =
      getBuildAttribute(build, "active_cooling") * coolingEfficiency)

    // Idle heat generation
    const heatGeneration = (heat.current.heat_generation = getBuildAttribute(
      build,
      "heat_generation"
    ))

    // Idle heat balance
    const idleHeat = (heat.current.idle_heat =
      heatGeneration - cooling - activeCooling)

    // Thrusting heat
    const thrustingHeat = (heat.current.thrusting_heat = getBuildAttribute(
      build,
      "thrusting_heat"
    ))
    // Reverse thrusting heat
    const reverseThrustingHeat = (heat.current.reverse_thrusting_heat =
      getBuildAttribute(build, "reverse_thrusting_heat"))
    // Turning heat
    const turningHeat = (heat.current.turning_heat = getBuildAttribute(
      build,
      "turning_heat"
    ))
    // Afterburner heat
    const afterburnerHeat = (heat.current.afterburner_heat = getBuildAttribute(
      build,
      "afterburner_heat"
    ))

    // Moving heat
    const movingHeat = (heat.current.moving_heat =
      Math.max(thrustingHeat, reverseThrustingHeat) +
      turningHeat +
      afterburnerHeat)

    // Firing heat
    const firingHeat = (heat.current.firing_heat = getBuildAttribute(
      build,
      "heat_per_second"
    ))

    // Shield regen heat
    const shieldHeat = (heat.current.shield_heat = getBuildAttribute(
      build,
      "shield_heat"
    ))
    // Hull regen heat
    const hullHeat = (heat.current.hull_heat = getBuildAttribute(
      build,
      "hull_heat"
    ))

    // Heat balance in action
    const actionHeat = (heat.current.action_heat =
      idleHeat + movingHeat + firingHeat + shieldHeat + hullHeat)

    // Heat dissipation
    const heatDissipation = (heat.current.heat_dissipation =
      getBuildAttribute(build, "heat_dissipation") * 6)

    // Maximum heat
    const maximumHeat = (heat.current.max_heat = emptyMass * heatDissipation)

    // Idle heat level
    const idleHeatLevel = (heat.current.idle_heat_level =
      idleHeat > 0 ? idleHeat / maximumHeat : 0)

    // Action heat level
    const actionHeatLevel = (heat.current.action_heat_level =
      actionHeat > 0 ? actionHeat / maximumHeat : 0)

    // Energy info
    // Energy generation
    const energyGeneration = (energy.current.energy_generation =
      getBuildAttribute(build, "energy_generation"))

    // Solar collection
    const solarCollection = (energy.current.solar_collection =
      getBuildAttribute(build, "solar_collection"))

    // Energy consumption
    const energyConsumption = (energy.current.energy_consumption =
      getBuildAttribute(build, "energy_consumption"))

    // Cooling energy
    const coolingEnergy = (energy.current.cooling_energy = getBuildAttribute(
      build,
      "cooling_energy"
    ))

    // Idle energy
    const idleEnergy = (energy.current.idle_energy =
      energyGeneration + solarCollection - energyConsumption - coolingEnergy)

    // Thrusting energy
    const thrustingEnergy = (energy.current.thrusting_energy =
      getBuildAttribute(build, "thrusting_energy"))
    // Reverse-thrusting energy
    const reverseThrustingEnergy = (energy.current.reverse_thrusting_energy =
      getBuildAttribute(build, "reverse_thrusting_energy"))
    // Turning energy
    const turningEnergy = (energy.current.turning_energy = getBuildAttribute(
      build,
      "turning_energy"
    ))
    // Afterburner energy
    const afterburnerEnergy = (energy.current.afterburner_energy =
      getBuildAttribute(build, "afterburner_energy"))

    // Moving energy
    const movingEnergy = (energy.current.moving_energy =
      Math.max(thrustingEnergy, reverseThrustingEnergy) +
      turningEnergy +
      afterburnerEnergy)

    // Firing energy
    const firingEnergy = (energy.current.firing_energy = getBuildAttribute(
      build,
      "energy_per_second"
    ))

    // Shield regen energy
    const shieldEnergy = (energy.current.shield_energy = getBuildAttribute(
      build,
      "shield_energy"
    ))

    // Hull regen energy
    const hullEnergy = (energy.current.hull_energy = getBuildAttribute(
      build,
      "hull_energy"
    ))

    // Energy in action
    const actionEnergy = (energy.current.action_energy =
      idleEnergy - movingEnergy - firingEnergy - shieldEnergy - hullEnergy)

    // Energy capacity
    const energyCapacity = (energy.current.energy_capacity = getBuildAttribute(
      build,
      "energy_capacity"
    ))

    // Damage
    // Shield DPS
    const shieldDps = (offense.current.shield_dps = getBuildAttribute(
      build,
      "shield_dps"
    ))

    // Hull DPS
    const hullDps = (offense.current.hull_dps = getBuildAttribute(
      build,
      "hull_dps"
    ))

    // Average DPS
    const averageDps = (offense.current.average_dps = (shieldDps + hullDps) / 2)

    // Heat DPS
    const heatDps = (offense.current.heat_dps = getBuildAttribute(
      build,
      "heat_dps"
    ))

    // Ion DPS
    const ionDps = (offense.current.ion_dps = getBuildAttribute(
      build,
      "ion_dps"
    ))

    // Slowing DPS
    const slowingDps = (offense.current.slowing_dps = getBuildAttribute(
      build,
      "slowing_dps"
    ))

    // Disruption DPS
    const disruptionDps = (offense.current.disruption_dps = getBuildAttribute(
      build,
      "disruption_dps"
    ))

    // Ammos
    offense.current.ammo_capacities = getAmmoData(state.allOutfits, build)
  }

  // Data to populate AggregatesTables
  const spaceData = {
    id: "spaceAggregates",
    title: "Space",
    labels: ["Free", "Total"],
    rows: [
      {
        key: "Outfit space",
        values: [
          state.spaceAggregates.free_outfit_space,
          state.spaceAggregates.total_outfit_space,
        ],
      },
      {
        key: "Engine capacity",
        values: [
          state.spaceAggregates.free_engine_capacity,
          state.spaceAggregates.total_engine_capacity,
        ],
      },
      {
        key: "Weapon capacity",
        values: [
          state.spaceAggregates.free_weapon_capacity,
          state.spaceAggregates.total_weapon_capacity,
        ],
      },
      {
        key: "Gun ports",
        values: [
          state.spaceAggregates.free_guns,
          state.spaceAggregates.total_guns,
        ],
        hideEmpty: true,
      },
      {
        key: "Turret mounts",
        values: [
          state.spaceAggregates.free_turrets,
          state.spaceAggregates.total_turrets,
        ],
        hideEmpty: true,
      },
      {
        key: "Fighter bays",
        values: [
          state.spaceAggregates.free_fighter_bays,
          state.spaceAggregates.total_fighter_bays,
        ],
        hideEmpty: true,
      },
      {
        key: "Drone bays",
        values: [
          state.spaceAggregates.free_drone_bays,
          state.spaceAggregates.total_drone_bays,
        ],
        hideEmpty: true,
      },
    ],
  }

  const heatData = {
    id: "heatAggregates",
    title: "Heat and Cooling",
    labels: null,
    rows: [
      {
        key: "Cooling efficiency",
        values: [state.heatAggregates.cooling_efficiency],
      },
      {
        key: "Net Cooling",
        values: [state.heatAggregates.cooling],
        hideEmpty: true,
      },
      {
        key: "Net active cooling",
        values: [state.heatAggregates.active_cooling],
        hideEmpty: true,
      },
      {
        key: "Heat generated when idle",
        values: [state.heatAggregates.heat_generation],
      },
      {
        key: "Heat balance when idle",
        values: [state.heatAggregates.idle_heat],
      },
      {
        key: "Heat level when idle",
        values: [state.heatAggregates.idle_heat_level],
      },
      {
        key: "Extra heat when moving",
        values: [state.heatAggregates.moving_heat],
      },
      {
        key: "Extra heat when firing",
        values: [state.heatAggregates.firing_heat],
      },
      {
        key: "Extra heat from shield regen",
        values: [state.heatAggregates.shield_heat],
        hideEmpty: true,
      },
      {
        key: "Extra heat from hull regen",
        values: [state.heatAggregates.hull_heat],
        hideEmpty: true,
      },
      {
        key: "Heat balance in action",
        values: [state.heatAggregates.action_heat],
      },
      {
        key: "Heat level in action",
        values: [state.heatAggregates.action_heat_level],
      },
      {
        key: "Max hull heat dissipation",
        values: [state.heatAggregates.max_heat],
      },
    ],
  }

  const energyData = {
    id: "energyAggregates",
    title: "Energy",
    labels: null,
    rows: [
      {
        key: "Energy generation",
        values: [
          state.energyAggregates.energy_generation +
            state.energyAggregates.solar_collection,
        ],
      },
      {
        key: "Energy balance when idle",
        values: [state.energyAggregates.idle_energy],
      },
      {
        key: "Energy used while moving",
        values: [state.energyAggregates.moving_energy],
      },
      {
        key: "Energy used while firing",
        values: [state.energyAggregates.firing_energy],
      },
      {
        key: "Energy for shield regen",
        values: [state.energyAggregates.shield_energy],
        hideEmpty: true,
      },
      {
        key: "Energy for hull regen",
        values: [state.energyAggregates.hull_energy],
        hideEmpty: true,
      },
      {
        key: "Energy balance in action",
        values: [state.energyAggregates.action_energy],
      },
      {
        key: "Energy capacity",
        values: [state.energyAggregates.energy_capacity],
      },
    ],
  }
  const offenseData = {
    id: "offenseAggregates",
    title: "Offense",
    labels: null,
    rows: [
      {
        key: "Shield DPS",
        values: [state.offenseAggregates.shield_dps],
        valuetips: [
          !_.isEmpty(state.currentBuild) && (
            <AggregatesTooltip
              build={state.currentBuild}
              attribute={"shield_damage"}
            />
          ),
        ],
        hideEmpty: true,
      },
      {
        key: "Hull DPS",
        values: [state.offenseAggregates.hull_dps],
        valuetips: [
          !_.isEmpty(state.currentBuild) && (
            <AggregatesTooltip
              build={state.currentBuild}
              attribute={"hull_damage"}
            />
          ),
        ],
        hideEmpty: true,
      },
      {
        key: "Average DPS",
        values: [state.offenseAggregates.average_dps],
        valuetips: [
          !_.isEmpty(state.currentBuild) && (
            <AggregatesTooltip
              build={state.currentBuild}
              attribute={"average_damage"}
            />
          ),
        ],
        hideEmpty: true,
      },
      {
        key: "Heat DPS",
        values: [state.offenseAggregates.heat_dps],
        valuetips: [
          !_.isEmpty(state.currentBuild) && (
            <AggregatesTooltip
              build={state.currentBuild}
              attribute={"heat_damage"}
            />
          ),
        ],
        hideEmpty: true,
      },
      {
        key: "Ion DPS",
        values: [state.offenseAggregates.ion_dps],
        valuetips: [
          !_.isEmpty(state.currentBuild) && (
            <AggregatesTooltip
              build={state.currentBuild}
              attribute={"ion_damage"}
            />
          ),
        ],
        hideEmpty: true,
      },
      {
        key: "Slowing DPS",
        values: [state.offenseAggregates.slowing_dps],
        valuetips: [
          !_.isEmpty(state.currentBuild) && (
            <AggregatesTooltip
              build={state.currentBuild}
              attribute={"slowing_damage"}
            />
          ),
        ],
        hideEmpty: true,
      },
      {
        key: "Disruption DPS",
        values: [state.offenseAggregates.disruption_dps],
        valuetips: [
          !_.isEmpty(state.currentBuild) && (
            <AggregatesTooltip
              build={state.currentBuild}
              attribute={"disruption_damage"}
            />
          ),
        ],
        hideEmpty: true,
      },
    ],
  }

  return (
    <div className="select-none flex flex-col">
      <AggregatesTable data={spaceData} />
      <AggregatesTable data={heatData} />
      <AggregatesTable data={energyData} />
      <AggregatesTable data={offenseData} />
    </div>
  )
}

export default BuildAggregates
