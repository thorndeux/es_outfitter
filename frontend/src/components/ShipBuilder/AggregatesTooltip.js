import React from 'react';
import { getBuildAttribute } from '../Utils';

const AggregatesTooltip = ({ build, attribute }) => {
  // Field type

  const dpsRows = (outfit_set) => {
    const rows = []
    for (let i = 0; i < outfit_set.amount; i++) {      
      rows.push(
      <tr key={i}>
        <td className="pr-2">{outfit_set.outfit.name}:</td>
        <td className="pr-2"><span className="font-medium">{Number(outfit_set.outfit.shots_per_second).toLocaleString('en', {maximumFractionDigits: '1'})}</span> shots/s</td>
        <td className="pr-2">&times; <span className="font-medium">{Number(outfit_set.outfit[attribute]).toLocaleString('en', {maximumFractionDigits: '1'})}</span> {attribute.replaceAll('_', ' ')}</td>
        <td>= <span className="font-semibold">{Number(outfit_set.outfit.shots_per_second * outfit_set.outfit[attribute]).toLocaleString('en', {maximumFractionDigits: '1'})}</span></td>
      </tr>)
    }
    return rows
  }

  return (
    <table className="text-sm">
      <tbody>
        {build.outfits.map((outfit_set) => {
          if (outfit_set.outfit[attribute] > 0){
            return dpsRows(outfit_set)
          }
        })}
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td className="font-bold pl-2.5"><span className="border-t border-gray-200">{getBuildAttribute(build, attribute.replace('damage', 'dps')).toLocaleString('en', {maximumFractionDigits: '1'})}</span></td>
        </tr>
      </tbody>
    </table>
  )
};

export default AggregatesTooltip;
