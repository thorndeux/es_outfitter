import React from 'react'

const BuildDetail = ({outfit, amount}) => {
  return (
    <tr>
      <td>{outfit}</td>
      <td>{amount}</td>
    </tr>
  )
}

export default BuildDetail
