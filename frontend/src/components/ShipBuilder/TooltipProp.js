import React from 'react'
import { labelize } from '../Utils'


const TooltipProp = ({ attribute, value }) => {

  // Don't show colon for booleans
  const booleans = ['unplunderable', 'automaton']

  return (
    <>
    <tr>
      <td>{labelize(attribute)}{!booleans.includes(attribute) && ':'}</td>
      <td className="pl-2">{isNaN(value) ? value : Number(value).toLocaleString('en', {maximumFractionDigits: '1'})}</td>
    </tr>
    </>
  )
}

export default TooltipProp
