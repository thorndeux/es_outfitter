import React, { useContext } from 'react';

import { DispatchContext, StateContext } from '../App';
import FieldProp from '../FieldProp'

const HullCard = ({ hull }) => {
  const state = useContext(StateContext)
  const dispatch = useContext(DispatchContext)

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
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

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
      <h2 className="text-xl font-medium hover: cursor-pointer" onClick={() => loadShipBuilder(hull)}>{hull.name}</h2>
      <p className="mb-2 hover: cursor-pointer" onClick={() => loadShipBuilder(hull)}>{hull.description}</p>
      <div className="relative">
        <h3 className="text-lg font-medium">Base Stats</h3>
        <table>
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
        {/* Absolute container to position image */}
        <div className="absolute flex inset-0 left-2/3 xs:left-1/2">
          <img className="m-auto max-h-40 xs:max-h-56 hover: cursor-pointer" src={`/static/${hull.sprite}`} alt={hull.name} onClick={() => loadShipBuilder(hull)}/>
        </div>
      </div>
    </div>
  )
}

export default HullCard;