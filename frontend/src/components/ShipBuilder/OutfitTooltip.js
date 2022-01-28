import React, { useEffect } from 'react'
import { stripe } from '../Utils';

import TooltipProp from './TooltipProp';

const OutfitTooltip = ({ outfit }) => {


  useEffect(() => {
    const table = document.getElementById(outfit.id)
    stripe(table)
  }, []);
  
  // Fields to exclude from list of attributes
  const excludedAttributes = [
    "id",
    "spoiler",
    "name",
    "release",
    "plural",
    "thumbnail",
    "sprite",
    "description",
    "ammo",
    "submunition_type",
  ]

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
        <h3 className="text-base font-medium">Base Stats</h3>
        <table id={outfit.id}>
          <tbody>
            {Object.keys(outfit).map((attribute) => {
              if (outfit[attribute] && 
                Number(outfit[attribute]) != 0 &&
                !excludedAttributes.includes(attribute) &&
                (attribute === 'faction' ? false : true)) {
                  return (
                    <TooltipProp key={attribute} attribute={attribute} value={outfit[attribute]} />
                  )
                }
              })
            }
            
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default OutfitTooltip
