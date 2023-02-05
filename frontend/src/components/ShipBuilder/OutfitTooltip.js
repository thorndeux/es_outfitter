import React, { useEffect } from "react"
import { labelize, stripe } from "../Utils"

/**
 * Simple component to turn a key-value pair into a presentable
 * table row
 *
 * @param {string} attribute Name of the attribute
 * @param {string, int, or boolean} value Value of the attribute
 * @param {boolean} highlight Whether the value should be highlighted as an important stat
 * @returns Table row with formatted values
 */
export const TooltipProp = ({ attribute, value, highlight }) => {
  // If hightlight is not provided, set it to false
  if (!highlight) {
    highlight = false
  }

  return (
    <>
      <tr>
        <td colSpan={"3"}>{labelize(attribute)}:</td>
        <td
          className={`pl-3${
            highlight && value > 0 ? " font-medium text-blue-400" : ""
          }`}
        >
          {isNaN(value)
            ? value
            : Number(value).toLocaleString("en", {
                maximumFractionDigits: "1",
              })}
        </td>
      </tr>
    </>
  )
}

export const DamageProp = ({ attribute, shotValue, dpsValue, spaceValue }) => {
  return (
    <>
      <tr>
        <td>{labelize(attribute)}:</td>
        <td className="pl-2 font-medium text-blue-400">
          {isNaN(shotValue)
            ? shotValue
            : Number(shotValue).toLocaleString("en", {
                maximumFractionDigits: "1",
              })}
        </td>
        <td className="pl-2 font-medium text-blue-400">
          {isNaN(dpsValue)
            ? dpsValue
            : Number(dpsValue).toLocaleString("en", {
                maximumFractionDigits: "1",
              })}
        </td>
        <td className="pl-2 text-center font-medium text-blue-400">
          {isNaN(spaceValue)
            ? spaceValue
            : Number(spaceValue).toLocaleString("en", {
                maximumFractionDigits: "1",
              })}
        </td>
      </tr>
    </>
  )
}

export const TwoStatHeader = ({ heading, spaceHeading }) => {
  return (
    <>
      <tr className="text-xs">
        <td colSpan={"2"} className="border-b border-gray-500 pt-1"></td>
        <td className="pl-2 border-b border-gray-500 pt-2">{heading}</td>
        <td className="pl-2 border-b border-gray-500 pt-2">{spaceHeading}</td>
      </tr>
    </>
  )
}

export const TwoStatProp = ({ attribute, value, spaceValue }) => {
  return (
    <>
      <tr>
        <td colSpan={"2"}>{labelize(attribute)}:</td>
        <td className="pl-2 text-center font-medium text-blue-400">
          {isNaN(value)
            ? value
            : Number(value).toLocaleString("en", {
                maximumFractionDigits: "1",
              })}
        </td>
        <td className="pl-2 text-center font-medium text-blue-400">
          {isNaN(spaceValue)
            ? spaceValue
            : Number(spaceValue).toLocaleString("en", {
                maximumFractionDigits: "1",
              })}
        </td>
      </tr>
    </>
  )
}

const general_attributes = [
  "cost",
  "mass",
  "firing_energy_per_second",
  "firing_heat_per_second",
  "firing_fuel_per_second",
  "heat_generation",
  "energy_consumption",
  "thrusting_energy",
  "thrusting_heat",
  "turning_energy",
  "turning_heat",
  "reverse_thrusting_energy",
  "reverse_thrusting_heat",
  "afterburner_energy",
  "afterburner_heat",
  "afterburner_fuel",
  "cooling_energy",
  "shield_energy",
  "shield_heat",
  "hull_energy",
  "hull_heat",
  "cooling_inefficiency",
]
const highlight_attributes = [
  "fuel_capacity",
  "outfit_space",
  "weapon_capacity",
  "cargo_space",
  "range",
  "shots_per_second",
  "ammo_capacity",
  "solar_collection",
  "energy_generation",
  "capture_attack",
  "capture_defense",
  "asteroid_scan_power",
  "cargo_scan_power",
  "outfit_scan_power",
  "tactical_scan_power",
  "atmosphere_scan",
  "scan_interference",
  "radar_jamming",
  "ramscoop",
  "bunks",
]
const damage_attributes = [
  "shield",
  "hull",
  "average",
  "heat",
  "ion",
  "slowing",
  "disruption",
  "anti_missile",
]
const propulsion_attributes = [
  "thrust",
  "turn",
  "reverse_thrust",
  "afterburner_thrust",
]

const OutfitTooltip = ({ outfit }) => {
  useEffect(() => {
    const table = document.getElementById(outfit.id)
    stripe(table)
  }, [])

  return (
    <div
      className="
      flex flex-col justify-between
      text-sm leading-snug"
    >
      <div>
        <h2 className="text-lg font-medium">{outfit.name}</h2>
      </div>
      <div>
        <table id={`${outfit.id}_tip`}>
          <tbody>
            {general_attributes.map((attribute) => {
              if (outfit[attribute] && Number(outfit[attribute]) != 0) {
                return (
                  <TooltipProp
                    key={attribute}
                    attribute={attribute}
                    value={outfit[attribute]}
                  />
                )
              }
            })}
            {highlight_attributes.map((attribute) => {
              if (outfit[attribute] && Number(outfit[attribute]) != 0) {
                return (
                  <TooltipProp
                    key={attribute}
                    attribute={attribute}
                    value={outfit[attribute]}
                    highlight={true}
                  />
                )
              }
            })}
            {["Guns", "Secondary Weapons", "Turrets", "Anti-missile"].includes(
              outfit.category
            ) && (
              <>
                <tr className="text-xs">
                  <td className="text-sm font-medium border-b border-gray-500 pt-1">
                    {outfit.anti_missile === 0 && "Damage per"}
                  </td>
                  <td className="pl-2 border-b border-gray-500 pt-2">shot</td>
                  <td className="pl-2 border-b border-gray-500 pt-2">sec</td>
                  <td className="pl-2 border-b border-gray-500 pt-2">
                    sec/space
                  </td>
                </tr>
                {damage_attributes.map((attribute) => {
                  if (
                    (outfit[`${attribute}_damage`] || outfit[attribute]) &&
                    Number(outfit[`${attribute}_damage`]) != 0
                  ) {
                    return (
                      <DamageProp
                        key={attribute}
                        attribute={attribute}
                        shotValue={
                          attribute === "anti_missile"
                            ? outfit[attribute]
                            : outfit[`${attribute}_damage`]
                        }
                        dpsValue={outfit[`${attribute}_dps`]}
                        spaceValue={outfit[`${attribute}_dps_per_space`]}
                      />
                    )
                  }
                })}
              </>
            )}
            {outfit.total_energy_generation > 0 && (
              <>
                <TwoStatHeader
                  key={"total_energy_generation"}
                  heading={"per sec"}
                  spaceHeading={"sec/space"}
                />
                <TwoStatProp
                  key={"total_energy_generation"}
                  attribute={"total_energy_generation"}
                  value={outfit.total_energy_generation}
                  spaceValue={outfit["total_energy_generation_per_space"]}
                />
              </>
            )}
            {outfit.energy_capacity > 0 && (
              <>
                <TwoStatHeader
                  key={"energy_capacity"}
                  heading={"total"}
                  spaceHeading={"per space"}
                />
                <TwoStatProp
                  key={"energy_capacity"}
                  attribute={"energy_capacity"}
                  value={outfit.energy_capacity}
                  spaceValue={outfit["energy_capacity_per_space"]}
                />
              </>
            )}
            {["Thruster", "Steering"].includes(outfit.category) && (
              <>
                <TwoStatHeader
                  key={"propulsion"}
                  heading={"total"}
                  spaceHeading={"per space"}
                />
                {propulsion_attributes.map((attribute) => {
                  if (outfit[attribute] && Number(outfit[attribute]) != 0) {
                    return (
                      <TwoStatProp
                        key={attribute}
                        attribute={attribute}
                        value={outfit[attribute]}
                        spaceValue={outfit[`${attribute}_per_space`]}
                      />
                    )
                  }
                })}
              </>
            )}
            {outfit.combined_cooling > 0 && (
              <TwoStatHeader
                key={"cooling"}
                heading={"per sec"}
                spaceHeading={"sec/space"}
              />
            )}
            {outfit.cooling > 0 && (
              <TwoStatProp
                key={"cooling"}
                attribute={"cooling"}
                value={outfit.cooling}
                spaceValue={outfit["cooling_per_space"]}
              />
            )}
            {outfit.active_cooling > 0 && (
              <TwoStatProp
                key={"active_cooling"}
                attribute={"active_cooling"}
                value={outfit.active_cooling}
                spaceValue={outfit["active_cooling_per_space"]}
              />
            )}
            {outfit.cooling > 0 && outfit.active_cooling > 0 && (
              <TwoStatProp
                key={"combined_cooling"}
                attribute={"combined_cooling"}
                value={outfit.combined_cooling}
                spaceValue={outfit["combined_cooling_per_space"]}
              />
            )}
            {outfit.category === "Shields" && (
              <>
                <TwoStatHeader
                  key={"shields"}
                  heading={"per sec"}
                  spaceHeading={"sec/space"}
                />
                {["shield_generation", "hull_repair_rate"].map((attribute) => {
                  if (outfit[attribute] && Number(outfit[attribute]) != 0) {
                    return (
                      <TwoStatProp
                        key={attribute}
                        attribute={attribute}
                        value={outfit[attribute]}
                        spaceValue={outfit[`${attribute}_per_space`]}
                      />
                    )
                  }
                })}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default OutfitTooltip
