/**
 * Utility function from Stackoverflow to sort by multiple fields
 * where the fields array contains the field names. If a name is
 * prepended with a '-', sort direction is reversed for that field.
 *
 * Adjusted to sort numeric strings as numbers instead
 *
 * @param {Array} fields  Array containing the names of fields to sort by
 * @returns               Sort instruction (1, -1, or 0, depending on case)
 */
export const sortByFields = (fields) => (a, b) =>
  fields
    .map((o) => {
      let dir = 1
      if (o[0] === "-") {
        dir = -1
        o = o.substring(1)
      }
      return isNaN(a[o])
        ? a[o] > b[o]
          ? dir
          : a[o] < b[o]
          ? -dir
          : 0
        : Number(a[o]) > Number(b[o])
        ? dir
        : Number(a[o]) < Number(b[o])
        ? -dir
        : 0
    })
    .reduce((p, n) => (p ? p : n), 0)

/**
 * Sorts by the sum of an array of fields, second, optional argument
 * is the sort direction ('desc' for descending)
 *
 * @param {Array} fields      Array of fields to sum up for each object
 * @param {String} direction  (optional) Reverse sort direction for 'desc'
 * @returns                   Sort instruction (1, -1, or 0, depending on case)
 */
export const sortByFieldSum =
  (fields, direction = "asc") =>
  (a, b) => {
    let dir = 1
    direction === "desc" && (dir = -1)
    const fieldSum = (o, fields) =>
      fields.reduce(
        (p, n) => (o[p] ? Number(o[p]) : 0) + (o[n] ? Number(o[n]) : 0)
      )
    return fieldSum(a, fields) > fieldSum(b, fields)
      ? dir
      : fieldSum(a, fields) < fieldSum(b, fields)
      ? -dir
      : 0
  }

/**
 * Sorts the outfits of a build by category
 *
 * @returns Sort instruction (1, -1, or 0, depending on case)
 */
export const sortByOutfitCategory = () => (a, b) => {
  const categoryOrder = [
    "Guns",
    "Secondary Weapons",
    "Ammunition",
    "Turrets",
    "Anti-missile",
    "Generators",
    "Batteries",
    "Shields",
    "Cooling",
    "Systems",
    "Hand to Hand",
    "Thruster",
    "Steering",
    "Special",
    "Hyperdrive",
  ]

  const categoryA = a.outfit.category
  const categoryB = b.outfit.category

  return categoryOrder.indexOf(categoryA) > categoryOrder.indexOf(categoryB)
    ? 1
    : categoryOrder.indexOf(categoryA) < categoryOrder.indexOf(categoryB)
    ? -1
    : 0
}
