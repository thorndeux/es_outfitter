import React, { useContext } from 'react'
import { StateContext } from './App'
import { labelize } from './Utils'


const FieldProp = ({ clickHandler, attribute, value, data_tip }) => {
  const state = useContext(StateContext)

  // Don't show colon for booleans
  const booleans = ['unplunderable', 'automaton']

  // Classes to add for clickable FieldProps
  const clickClasses = clickHandler && "hover:cursor-pointer hover:bg-gray-600"
  // Classes to add for attribute being sorted by
  const sortClasses =  (clickHandler && ((state.shipBuilder && attribute == state.outfitSort) || (state.hullSelect && attribute == state.hullSort))) && "font-bold text-yellow-500"

  const classes = [clickClasses, sortClasses].join(' ')

  return (
    <>
    <tr onClick={clickHandler && clickHandler} className={classes} data-tip={data_tip && labelize(data_tip)}>
      <td>{labelize(attribute)}{!booleans.includes(attribute) && ':'}</td>
      <td className="pl-2">{isNaN(value) ? value : Number(value).toLocaleString('en', {maximumFractionDigits: '1'})}</td>
    </tr>
    </>
  )
}

export default FieldProp
