import React, { useContext } from 'react'
import { DispatchContext, StateContext } from '../App'
import { addOutfit } from '../Utils'

import FieldProp from '../FieldProp'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

const OutfitCard = ({ outfit }) => {
  const dispatch = useContext(DispatchContext)
  const state = useContext(StateContext)

  const handleAddOutfit = (e, outfit) => {
    const result = addOutfit(e, outfit, state.currentBuild)
    if (typeof result === 'string') {
      console.log(result)
      return
    }
    else {
      dispatch({ type: 'setBuildOutfits', payload: result})
    }
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
    "submunition_type",
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
          <button 
            data-tip="Add"
            onClick={e => handleAddOutfit(e, outfit)}
            className="
              float-right
              text-xl leading-none
              text-lime-600 hover:text-lime-500
              p-1
            ">
            <FontAwesomeIcon icon={faPlus} />
          </button>
      </h2>
      <p className="mb-2 clear-both">{outfit.description}</p>
      <div className="relative min-h-40">
        <h3 className="text-lg font-medium">Base Stats</h3>
        <table>
          <tbody>
            {Object.keys(outfit).map((attribute) => {
              if (outfit[attribute] && 
                Number(outfit[attribute]) != 0 &&
                !excludedAttributes.includes(attribute) &&
                (attribute === 'faction' ? state.spoiler.value > 1 ? true : false : true)) {
                  return (
                    <FieldProp clickHandler={() => dispatch({ type: 'sortOutfits', payload: attribute })} key={attribute} attribute={attribute} value={outfit[attribute]} data_tip={`Sort by ${attribute}`}/>
                  )
                }
              })
            }
            
          </tbody>
        </table>
        {/* Absolute container to position image */}
        <div className="absolute flex inset-0 left-2/3 xs:left-1/2">
          {outfit.thumbnail &&
            <img className="m-auto max-h-32 xs:max-h-56" src={`/static/${outfit.thumbnail}`} alt={outfit.name} />}
        </div>
      </div>
    </div>
  )
}
export default OutfitCard
