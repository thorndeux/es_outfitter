import React, { useContext } from 'react';

import { DispatchContext } from '../App';
import FieldProp from '../FieldProp'

const HullCard = ({ hull }) => {
  const dispatch = useContext(DispatchContext)

  // Fields to exclude from list of attributes
  const excludedAttributes = [
    "id",
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
      text-sm
      p-2
      filter hover:brightness-110"
      onClick={() => loadShipBuilder(hull)}
    >
      <h2 className="text-lg">{hull.name}</h2>
      <p className="mb-2">{hull.description}</p>
      <div className="relative">
        <h3 className="text-base">Base Stats</h3>
        <table>
          <tbody>
            {Object.keys(hull).map((attribute) => {
              if (hull[attribute] && 
                hull[attribute] != "0.00" &&
                !excludedAttributes.includes(attribute)) {
                  return (
                    <FieldProp key={attribute} attribute={attribute} value={hull[attribute]} />
                  )
                }
              })
            }
            
          </tbody>
        </table>
        {/* Absolute container to position image */}
        <div className="absolute flex inset-0 left-2/3 xs:left-1/2">
          <img className="m-auto max-h-40 xs:max-h-56" src={`/static/${hull.sprite}`} alt={hull.name} />
        </div>
      </div>
    </div>
  )
}

export default HullCard;