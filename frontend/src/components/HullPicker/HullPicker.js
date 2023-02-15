import React from "react"

import HullList from "./HullList/HullList"
import HullSelect from "./HullSelect/HullSelect"

const HullPicker = () => {
  return (
    <div
      className="
      container mx-auto
      grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 
      content-start
      bg-gray-600"
    >
      <HullSelect />
      <HullList />
    </div>
  )
}

export default HullPicker
