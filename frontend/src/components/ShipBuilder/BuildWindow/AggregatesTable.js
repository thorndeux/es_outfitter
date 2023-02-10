import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

const AggregatesTable = ({ data }) => {
  const percentages = [
    "Cooling efficiency",
    "Heat level when idle",
    "Heat level in action",
  ]

  const rows = data.rows.filter(
    (row) => !row.hideEmpty || row.values[row.values.length - 1] > 0
  )

  return (
    <div className="grow border-2 border-gray-200 rounded-lg px-2 py-1 mt-1">
      <table id={data.id} className="w-full mb-1">
        <tbody>
          <tr className="text-sm text-gray-300 nostripe">
            <td className="text-base font-medium text-blue-400">
              {data.title}
            </td>
            {data.labels ? (
              <>
                <td className="pt-2 w-14">{data.labels[0]}</td>
                <td className="pt-2 w-16">{data.labels[1]}</td>
              </>
            ) : (
              <td className="w-16"></td>
            )}
          </tr>
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row.key}>
                <td>
                  <span
                    data-tip={row.keytip && renderToStaticMarkup(row.keytip)}
                    data-class="max-w-xs sm:max-w-prose"
                  >
                    {row.key}
                  </span>
                </td>
                {row.values.map((value, index) =>
                  percentages.includes(row.key) ? (
                    <td key={index}>
                      <span
                        data-tip={
                          row.valuetips &&
                          row.valuetips[index] &&
                          renderToStaticMarkup(row.valuetips[index])
                        }
                      >
                        {value.toLocaleString(undefined, {
                          style: "percent",
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                  ) : (
                    <td key={index}>
                      <span
                        data-tip={
                          row.valuetips &&
                          row.valuetips[index] &&
                          renderToStaticMarkup(row.valuetips[index])
                        }
                      >
                        {value.toLocaleString("en", {
                          maximumFractionDigits: "1",
                        })}
                      </span>
                    </td>
                  )
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td>Pacifist!</td>
              <td></td>
              <td></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default AggregatesTable
