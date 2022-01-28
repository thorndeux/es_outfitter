import React, { useContext, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';

import { DispatchContext, StateContext } from '../App';
import FieldProp from '../FieldProp'
import { stripe } from '../Utils';

const HullCard = ({ hull }) => {
  const state = useContext(StateContext)
  const dispatch = useContext(DispatchContext)

  useEffect(() => {
    const table = document.getElementById(hull.id)
    stripe(table)
  }, [state.displayedHulls]);
  

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
    "default_build",
    "base_model",
  ]

  const loadShipBuilder = (hull) => {
    dispatch({ type: 'shipBuilder', payload:hull })
    ReactTooltip.hide()
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  return (
    <div className="
      flex-grow
      flex flex-col justify-between
      text-gray-200
      bg-gradient-to-br from-gray-600 to-gray-500 
      border border-gray-400 rounded-sm 
      w-full sm:w-96 h-auto
      text-base
      p-2
      filter hover:brightness-110"
    >
      <div
        className="hover:cursor-pointer" 
        data-tip={`Start new build with ${hull.name}`}
        data-arrow-color="transparent"
      >
        <h2 className="text-xl font-medium" onClick={() => loadShipBuilder(hull)}>{hull.name}</h2>
        <p className="text-justify" onClick={() => loadShipBuilder(hull)}>{hull.description}</p>
      </div>
      <div
        className="flex hover:cursor-pointer"
        onClick={() => loadShipBuilder(hull)}
        data-tip={`Start new build with ${hull.name}`}
        data-arrow-color="transparent"
      >
        <img className="m-auto max-h-64 drop-shadow-xl py-5" src={`/static/${hull.sprite}`} alt={hull.name} onClick={() => loadShipBuilder(hull)}/>
      </div>
      <div>
        <h3 className="text-lg font-medium">Base Stats</h3>
        <table id={hull.id} className="w-full">
          <tbody>
            {Object.keys(hull).map((attribute) => {
              if (hull[attribute] && 
                Number(hull[attribute]) != 0 &&
                !excludedAttributes.includes(attribute) &&
                (attribute === 'faction' ? state.spoiler.value > 1 ? true : false : true)) {
                  return (
                    <FieldProp clickHandler={() => dispatch({ type: 'sortHulls', payload: attribute })} key={attribute} attribute={attribute} value={hull[attribute]} data_tip={`Sort by ${attribute}`}/>
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

export default HullCard;