import React from 'react'

const FieldProp = ({ attribute, value }) => {
  // Removes space from key (if any) and capitalizes it
  const labelize = (attribute) => {
    return attribute.replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase())
  }

  const booleans = ['unplunderable', 'automaton']

  return (
    <>
    <tr>
      <td>{labelize(attribute)}{!booleans.includes(attribute) && ':'}</td>
      <td className="pl-2">{isNaN(value) ? value : Number(value)}</td>
    </tr>
    </>
  )
}

export default FieldProp
