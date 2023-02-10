/**
 * Translates an attribute name into a string that can
 * can be displayed as a label, i.e. replaces underscores
 * with spaces and capitalizes the first letter.
 *
 * @param {String} attribute Attribute to be labelized
 * @returns Labelized string
 */
const labelize = (attribute) => {
  return attribute.replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase())
}

export default labelize
