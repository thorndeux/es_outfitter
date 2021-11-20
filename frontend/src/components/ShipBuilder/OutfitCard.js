import React from 'react'

import FieldProp from '../FieldProp'

const OutfitCard = ({ outfit }) => {
  // Fields to exclude from list of attributes
  const excludedAttributes = [
    "id",
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
      text-sm
      p-2
      filter hover:brightness-110"
    >
      <h2 className="text-lg">{outfit.name}</h2>
      <p className="mb-2">{outfit.description}</p>
      <div className="relative min-h-40">
        <h3 className="text-base">Base Stats</h3>
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
