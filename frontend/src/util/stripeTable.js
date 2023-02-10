/**
 * Formats a table with alternating striped rows,
 * where odd rows are colored and even rows remain
 * unchanged.
 *
 * Rows with the class .nostripe will be ignored
 *
 * @param {HTML table element} table Table to be striped
 */
const stripeTable = (table) => {
  const rows = table.querySelectorAll("tr:not(.nostripe)")
  for (var i = 0; i < rows.length; i++) {
    if (i % 2 == 0) {
      rows[i].classList.add("bg-gray-500")
    } else {
      rows[i].classList.remove("bg-gray-500")
    }
  }
}

export default stripeTable
