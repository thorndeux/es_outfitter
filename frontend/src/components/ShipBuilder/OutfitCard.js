import React, { useContext } from 'react'
import { DispatchContext, StateContext } from '../App'

import FieldProp from '../FieldProp'

const OutfitCard = ({ outfit }) => {
  const dispatch = useContext(DispatchContext)
  const state = useContext(StateContext)

  const addOutfit = (outfit, amount) => {
    // Validation logic goes here:
        // Outfit space
        // Engine space
        // Weapon space
        // Cargo space
        // Gun ports
        // Turret slots
        // Fighter bays
        // Drone bays
        // Spinal mount
    
    // If validation succeeds, determine new outfits
    const newOutfits = _.cloneDeep(state.currentBuild.outfits)
    const inBuild = newOutfits.find(outfit_set => outfit_set.outfit.id === outfit.id)
    if (inBuild) {
      inBuild.amount += amount
      dispatch({ type: 'setBuildOutfits', payload: newOutfits})
    }
    else {
      const outfit_set = { "amount": amount, "outfit": outfit }
      newOutfits.push(outfit_set)
      dispatch({ type: 'setBuildOutfits', payload: newOutfits})
    }
    // Implement ordering of outfits
  }

  const removeOutfit = (outfit, amount) => {
    // If validation succeeds, determine new outfits
    const newOutfits = _.cloneDeep(state.currentBuild.outfits)
    const outfit_set = newOutfits.find(outfit_set => outfit_set.outfit.id === outfit.id)
    if (outfit_set.amount > amount) {
      outfit_set.amount -= amount
    }
    else {
      // Remove outfit_set
      newOutfits.splice(newOutfits.indexOf(outfit_set), 1)
    }
    dispatch({ type: 'setBuildOutfits', payload: newOutfits})    
  }

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
  ]

  return (
    <div className="
      flex-grow
      bg-gradient-to-br from-gray-600 to-gray-500 
      border border-gray-400 rounded-sm 
      w-full sm:w-96 h-auto
      text-base
      p-2
      filter hover:brightness-110"
    >
      
      <h2 className="text-xl font-medium">
        {outfit.name}
        {state.editMode && 
          <button 
          onClick={() => addOutfit(outfit, 1)}
            className="
              float-right
              text-base text-lime-600 bg-gray-700
              border border-2 border-lime-600 rounded p-1 mb-1
              hover:bg-gray-600
            ">Add to build</button>
        }
      </h2>
      <p className="mb-2 clear-both">{outfit.description}</p>
      <div className="relative min-h-40">
        <h3 className="text-lg font-medium">Base Stats</h3>
        <table>
          <tbody>
            {Object.keys(outfit).map((attribute) => {
              if (outfit[attribute] && 
                Number(outfit[attribute]) != 0 &&
                !excludedAttributes.includes(attribute)) {
                  return (
                    <FieldProp key={attribute} attribute={attribute} value={outfit[attribute]} />
                  )
                }
              })
            }
            
          </tbody>
        </table>
        {/* Absolute container to position image */}
        <div className="absolute flex inset-0 left-2/3 xs:left-1/2">
          <img className="m-auto max-h-32 xs:max-h-56" src={`/static/${outfit.thumbnail}`} alt={outfit.name} />
        </div>
      </div>
    </div>
  )
}
export default OutfitCard
