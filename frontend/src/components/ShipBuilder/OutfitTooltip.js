import React, { useEffect } from 'react'
import { labelize, stripe } from '../Utils';

/**
 * Simple component to turn a key-value pair into a presentable
 * table row
 * 
 * @param {string} attribute Name of the attribute
 * @param {string, int, or boolean} value Value of the attribute
 * @returns Table row with formatted values
 */
export const TooltipProp = ({ attribute, value }) => {

  // Don't show colon for booleans
  const booleans = ['unplunderable', 'automaton']

  return (
    <>
    <tr>
      <td colSpan={'3'}>{labelize(attribute)}{!booleans.includes(attribute) && ':'}</td>
      <td className="pl-2">{isNaN(value) ? value : Number(value).toLocaleString('en', {maximumFractionDigits: '1'})}</td>
    </tr>
    </>
  )
}

export const DamageProp = ({ attribute, shotValue, dpsValue, spaceValue }) => {

  return (
    <>
    <tr>
      <td>{labelize(attribute)}:</td>
      <td className="pl-2">{isNaN(shotValue) ? shotValue : Number(shotValue).toLocaleString('en', {maximumFractionDigits: '1'})}</td>
      <td className="pl-2">{isNaN(dpsValue) ? dpsValue : Number(dpsValue).toLocaleString('en', {maximumFractionDigits: '1'})}</td>
      <td className="pl-2">{isNaN(spaceValue) ? spaceValue : Number(spaceValue).toLocaleString('en', {maximumFractionDigits: '1'})}</td>
    </tr>
    </>
  )
}

const general_attributes = ['cost', 'mass', 'ammo_capacity', 'outfit_space']
const weapon_attributes = ['weapon_capacity', 'firing_energy_per_second', 'firing_heat_per_second', 'firing_fuel_per_second', 'range', 'shots_per_second']
const damage_attributes = ['shield', 'hull', 'average', 'heat', 'ion', 'slowing', 'disruption', 'anti_missile']

const OutfitTooltip = ({ outfit }) => {

  useEffect(() => {
    const table = document.getElementById(outfit.id)
    stripe(table)
  }, []);
  
  return (
    <div className="
      flex flex-col justify-between
      text-sm leading-snug"
    >
      
      <div>
        <h2 className="text-lg font-medium">
          {outfit.name}            
        </h2>
      </div>      
      <div>
        <table id={`${outfit.id}_tip`}>
          <tbody>
            {general_attributes.map(attribute => {
              if (outfit[attribute] && Number(outfit[attribute]) != 0) {
                return <TooltipProp key={attribute} attribute={attribute} value={outfit[attribute]} />
              }
            })}
            {['Guns', 'Secondary Weapons', 'Turrets', 'Anti-missile'].includes(outfit.category) && weapon_attributes.map(attribute => {
              if (outfit[attribute] && Number(outfit[attribute]) != 0) {
                return <TooltipProp key={attribute} attribute={attribute} value={outfit[attribute]} />
              }
            })}
            {['Guns', 'Secondary Weapons', 'Turrets', 'Anti-missile'].includes(outfit.category) &&(<tr className="text-xs">
              <td className="text-sm font-medium border-b border-gray-500 pt-1"><span>Damage</span> per</td>
              <td className="pl-2 border-b border-gray-500 pt-2">shot</td>
              <td className="pl-2 border-b border-gray-500 pt-2">sec</td>
              <td className="pl-2 border-b border-gray-500 pt-2">sec/space</td>
            </tr>)}
            {['Guns', 'Secondary Weapons', 'Turrets', 'Anti-missile'].includes(outfit.category) && damage_attributes.map(attribute => {
              if ((outfit[`${attribute}_damage`] || outfit[attribute]) && Number(outfit[`${attribute}_damage`]) != 0) {
                return <DamageProp key={attribute} attribute={attribute} shotValue={attribute === 'anti_missile' ? outfit[attribute] : outfit[`${attribute}_damage`]} dpsValue={outfit[`${attribute}_dps`]} spaceValue={outfit[`${attribute}_dps_per_space`]} />
              }
            })}       
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default OutfitTooltip
