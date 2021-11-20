import React from 'react'

import BuildWindow from './BuildWindow'
import OutfitSelect from './OutfitSelect'
import OutfitList from './OutfitList'

const ShipBuilder = () => {
  return (
    <div className="
      container mx-auto
      grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 
      content-start
      text-gray-300 bg-gray-600"
    >
      <BuildWindow />
      <OutfitSelect />
      <OutfitList />
    </div>
  )
}

export default ShipBuilder
