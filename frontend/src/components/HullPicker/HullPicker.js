import React from "react"

import HullList from "./HullList/HullList"
import SelectMenu from "./HullSelect/HullSelect"

const HullSelect = () => {
  return (
    <div
      className="
      container mx-auto
      grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 
      content-start
      bg-gray-600"
    >
      <SelectMenu />
      <HullList />
    </div>
  )
}

export default HullSelect
