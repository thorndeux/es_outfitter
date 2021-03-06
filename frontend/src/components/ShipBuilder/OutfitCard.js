import React, { useContext, useEffect } from 'react'

import { FaPlus } from 'react-icons/fa'

import { DispatchContext, StateContext } from '../App'

import { addOutfit, stripe } from '../Utils'

import FieldProp from '../FieldProp'
import toast from 'react-hot-toast'


const OutfitCard = ({ outfit }) => {
  const dispatch = useContext(DispatchContext)
  const state = useContext(StateContext)

  useEffect(() => {
    const table = document.getElementById(outfit.id)
    stripe(table)
  }, [state.displayedOutfits]);
  

  const handleAddOutfit = (e, outfit) => {
    const result = addOutfit(e, outfit, state.currentBuild)
    if (typeof result.attribute === 'string') {
      toast.error(
        <div>
          <p>Not enough <span className="font-bold">{result.attribute.replaceAll("_", " ")}</span>  to add <span className="font-bold">{outfit.name}</span>.</p>
          <p className="pt-2">Required: <span className="font-bold text-blue-400">{Math.abs(outfit[result.attribute])}</span> - Remaining: <span className="font-bold text-red-500">{result.remaining}</span></p>
        </div>
      ) 
    }
    else {
      dispatch({ type: 'setBuildOutfits', payload: result.outfits })
      toast.success(<p>Added <span className="font-bold">{result.amount}</span> &times; <span className="font-bold">{outfit.name}</span>!</p>)
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
      flex flex-col justify-between
      bg-gradient-to-br from-gray-600 to-gray-500 
      border border-gray-400 rounded-sm 
      w-full sm:w-96 h-auto
      text-base
      p-2
      filter hover:brightness-110"
    >
      
      <div>
        <h2 className="text-xl font-medium">
          {outfit.name}
            <div className="float-right">
              {state.multi && <span className="pr-2"> &times; {state.multi}</span>}
              <button
                data-tip="Add"
                onClick={e => handleAddOutfit(e, outfit)}
                className="                  
                  text-xl leading-none
                  text-lime-600 hover:text-lime-500
                  p-1
                ">                
                <FaPlus />
              </button>
            </div>
        </h2>
        <p className="text-justify">{outfit.description}</p>
      </div>
      <div className="flex">
        {outfit.thumbnail &&
          <img className="m-auto max-h-64 drop-shadow-xl py-5" src={`/static/${outfit.thumbnail}`} alt={outfit.name} />}
      </div>
      <div>
        <h3 className="text-lg font-medium">Base Stats</h3>
        <table id={outfit.id} className="w-full mb-auto">
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
      </div>
    </div>
  )
}
export default OutfitCard
