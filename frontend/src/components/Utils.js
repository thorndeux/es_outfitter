import { cloneDeep } from 'lodash'

/**
 * Translates an attribute name into a string that can
 * can be displayed as a label, i.e. replaces underscores
 * with spaces and capitalizes the first letter.
 * 
 * @param {String} attribute Attribute to be labelized
 * @returns Labelized string
 */
export const labelize = (attribute) => {
  return attribute.replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase())
}
  
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
  export const fieldSorter = (fields) => (a, b) => fields.map(o => {
  let dir = 1;
  if (o[0] === '-') { dir = -1; o=o.substring(1); }
  return isNaN(a[o]) ? (a[o] > b[o] ? dir : a[o] < b[o] ? -(dir) : 0) : (Number(a[o]) > Number(b[o]) ? dir : Number(a[o]) < Number(b[o]) ? -(dir) : 0);
}).reduce((p, n) => p ? p : n, 0);

/**
 * Sorts by the sum of an array of fields, second, optional argument
 * is the sort direction ('desc' for descending)
 * 
 * @param {Array} fields      Array of fields to sum up for each object
 * @param {String} direction  (optional) Reverse sort direction for 'desc' 
 * @returns                   Sort instruction (1, -1, or 0, depending on case)
 */
export const sortByFieldSum = (fields, direction='asc') => (a, b) => {
  let dir = 1
  direction === 'desc' && (dir = -1)
  const fieldSum = (o, fields) => fields.reduce((p, n) => (o[p] ? Number(o[p]) : 0) + (o[n] ? Number(o[n]) : 0))
  return fieldSum(a, fields) > fieldSum(b, fields) ? dir : fieldSum(a, fields) < fieldSum(b, fields) ? -(dir) : 0
}

/**
 * Sorts the outfits of a build by category
 * 
 * @returns Sort instruction (1, -1, or 0, depending on case)
 */
export const sortByOutfitCategory = () => (a, b) => {
  const categoryOrder = ['Guns', 'Secondary Weapons', 'Ammunition', 'Turrets', 'Anti-missile', 'Generators', 'Batteries', 'Shields', 'Cooling', 'Systems', 'Hand to Hand', 'Thruster', 'Steering', 'Special', 'Hyperdrive']
    
  const categoryA = a.outfit.category
  const categoryB = b.outfit.category
  
  return categoryOrder.indexOf(categoryA) > categoryOrder.indexOf(categoryB) ? 1 : categoryOrder.indexOf(categoryA) < categoryOrder.indexOf(categoryB) ? -1 : 0
}

/**
 * Checks how much storage for the specified ammo is available
 * in the provided build
 * 
 * @param {Build Object} build Build for which to check the ammo capacity
 * @param {int} ammo_id ID of the ammo to check
 * @returns The builds capacity for the ammo with the specified ID
 */
export const getAmmoCapacity = (build, ammo_id) => {
  return build.outfits.reduce(((previous, current) => previous + (current.outfit.ammo === ammo_id ? current.outfit.ammo_capacity * current.amount : 0)), 0)
}

/**
 * Compiles data on each ammo type present in the provided build
 * 
 * @param {Build Object} build Build for which to compile the ammo data
 * @returns List of objects containing the following value for each ammo_type:
 *          {name: Name of the ammo,
 *           id: Id of the ammo,
 *           capacity: Max capacity for the ammo in build,
 *           stock: Current stock of ammo in build}
 */
export const getAmmoData = (allOutfits, build) => {
  // Compile list of ammo_types in build    
  const ammo_types = new Set(build.outfits.filter(outfit_set => outfit_set.outfit.ammo).map(outfit_set => outfit_set.outfit.ammo && outfit_set.outfit.ammo))

  // Calculate build data for each ammo_type
  const ammoData = []
  ammo_types.forEach(ammo_type => ammoData.push({
    name: allOutfits.find(outfit => outfit.id === ammo_type).name,
    id: ammo_type,
    capacity: getAmmoCapacity(build, ammo_type),
    stock: (build.outfits.find(outfit_set => outfit_set.outfit.id === ammo_type) ? build.outfits.find(outfit_set => outfit_set.outfit.id === ammo_type).amount : 0)}))
  return ammoData
}

/**
 * Gets the total value (hull + outifts) of an attribute for a specific build
 * 
 * @param {Build Object} build Build for which the attribute should be calculated
 * @param {str} attributeName Name of the attribute to be parsed
 * @returns Attribute value as a float
 */
export const getBuildAttribute = (build, attributeName) => {    
  return build.outfits.reduce(((previous, current) => previous + (current.amount * (parseFloat(current.outfit[attributeName] || 0)))), parseFloat(build.hull[attributeName]) || 0)
}

export const compileAttributeTable = (build, attributeName) => {
  const table = ['<table>', '</table>']
  build.hull[attributeName] && table.splice(table.length - 1, 0, `<tr><td>${build.hull.name}:</td><td><strong>${build.hull[attributeName]}</strong> ${attributeName}</td></tr>`)
  // build.outfits.map(outfit_set)
  return table.join('')
  
}


/**
 * Checks the maximum number of outfits of the provided type
 * that could be added to the provided build without exceeding
 * any resource requirements
 * 
 * @param {Build Object} build Build to check for max capacity
 * @param {Outfit object} outfit Outfit to check for max number
 * @returns Maximum number of outfits that fit in build OR
 *          string containing error message.
 */
export const maxOutfitsToAdd = (build, outfit) => {
  const attributes_to_check = ['gun_ports', 'turret_mounts', 'engine_capacity', 'weapon_capacity', 'outfit_space', 'cargo_space', 'required_crew']
  let max_outfits_to_add = 100000

  // Check maximum amount of outfits that can be added
  // and return an error if the maximum is 0
  for (const attribute of attributes_to_check) {
    // Only check if the attribute is substracted, not added
    if (outfit[attribute] < 0) {
      const freeAttribute = getBuildAttribute(build, attribute)
      max_outfits_to_add = Math.min(max_outfits_to_add, Math.floor(freeAttribute / Math.abs(outfit[attribute])))
      if (max_outfits_to_add === 0) {
        return `Not enough ${attribute.replaceAll("_", " ")} (${freeAttribute} remaining) to add ${outfit.name} (${Math.abs(outfit[attribute])} required).`
      }
    }
  }

  // Check different ammo capacities
  // Compile list of ammo_types in build    
  const ammo_types = new Set(build.outfits.filter(outfit_set => outfit_set.outfit.ammo).map(outfit_set => outfit_set.outfit.ammo && outfit_set.outfit.ammo))

  for (const ammo_type of ammo_types) {
    if (outfit.ammo_capacity < 0){
      const capacity = getAmmoCapacity(build, ammo_type)
      const stock = (build.outfits.find(outfit_set => outfit_set.outfit.id === ammo_type) ? build.outfits.find(outfit_set => outfit_set.outfit.id === ammo_type).amount : 0)
      max_outfits_to_add = Math.min(max_outfits_to_add, (capacity - stock))
      if (max_outfits_to_add === 0) {
        return `Not enough ammo capacity (${capacity - stock} remaining) to add ${outfit.name} (${Math.abs(outfit.ammo_capacity)} required).`
      }
    }
  }

  return max_outfits_to_add
}

/**
 * Handles adding an outfit to the current build.
 * Supports multipliers for Shift (*5) and/or Ctrl (*20)
 * clicking.
 * 
 * @param {SyntheticEvent} e Event triggering the handler
 * @param {Outfit object} outfit Outfit to be added
 * @returns New outfits or an error message, if there is
 *          not enough room to fit at least one more outfit.
 */
 export const addOutfit = (e, outfit, build) => {
  // Check how many of the outfit can be added
  const max_outfit_number = maxOutfitsToAdd(build, outfit)
  // If there is no more room, return a message specifying
  // the limiting resource
  if (isNaN(max_outfit_number)) {
    return max_outfit_number
  }
    
  // Adjust amount if Shift and/or Ctrl were pressed
  var amount = 1
  e.shiftKey && (amount *= 5)
  e.ctrlKey && (amount *= 20)
  e.getModifierState('AltGraph') && (amount = max_outfit_number)

  // Cap amount at max outfit number
  amount = Math.min(amount, max_outfit_number)
  
  // Make a temporary copy of the current build
  const newBuild = cloneDeep(build)

  // Adjust outfits
  const newOutfits = newBuild.outfits
  const inBuild = newOutfits.find(outfit_set => outfit_set.outfit.id === outfit.id)
  // If the outfit is already in the build, increase the amount accordingly
  if (inBuild) {
    inBuild.amount += amount
  }
  // Else create a new outfit set
  else {
    const outfit_set = { "amount": amount, "outfit": outfit }
    newOutfits.push(outfit_set)
  }

  // Make sure outfits are in the correct order
  newOutfits.sort(sortByOutfitCategory())

  // Update outfits of current build
  return newOutfits
}


/**
 * Checks the maximum number of outfits of the provided type
 * that could be removed from the provided build without exceeding
 * any resource requirements
 * 
 * @param {Build Object} build Build to check for max capacity
 * @param {Outfit object} outfit Outfit to check for max number
 * @returns Maximum number of outfits that can be removed OR
 *          string containing error message.
 */
 export const maxOutfitsToRemove = (build, outfit) => {
  const attributes_to_check = ['outfit_space', 'cargo_space', 'ammo_capacity']
  let max_outfits_to_remove = 100000

  // Check maximum amount of outfits that can be removed
  // and return an error if the maximum is 0
  for (const attribute of attributes_to_check) {
    // Only check if the outfit adds to the attribute (expansions), not when it substracts from it
    if (outfit[attribute] > 0) {
      const freeAttribute = getBuildAttribute(build, attribute)
      max_outfits_to_remove = Math.min(max_outfits_to_remove, Math.floor(freeAttribute / outfit[attribute]))
      if (max_outfits_to_remove === 0) {
        return `Not enough ${attribute.replaceAll("_", " ")} (${freeAttribute} remaining) to remove ${outfit.name} (${Math.abs(outfit[attribute])} required).`
      }
    }
  }

  // Check different ammo capacities
  // Compile list of ammo_types in build    
  const ammo_types = new Set(build.outfits.filter(outfit_set => outfit_set.outfit.ammo).map(outfit_set => outfit_set.outfit.ammo && outfit_set.outfit.ammo))

  for (const ammo_type of ammo_types) {
    // Only check if the outfit adds to the attribute (storage racks), not when it substracts from it
    if (outfit.ammo_capacity > 0){
      const capacity = getAmmoCapacity(build, ammo_type)
      const stock = (build.outfits.find(outfit_set => outfit_set.outfit.id === ammo_type) ? build.outfits.find(outfit_set => outfit_set.outfit.id === ammo_type).amount : 0)
      max_outfits_to_remove = Math.min(max_outfits_to_remove, Math.floor((capacity - stock) / outfit.ammo_capacity))
      if (max_outfits_to_remove === 0) {
        return `Not enough free ammo capacity (${capacity - stock} remaining) to remove ${outfit.name} (${Math.abs(outfit.ammo_capacity)} required).`
      }
    }
  }

  return max_outfits_to_remove
}


/**
 * Handles removing an outfit from the current build.
 * Supports multipliers for Shift (*5) and/or Ctrl (*20)
 * clicking.
 * 
 * @param {SyntheticEvent} e Event triggering the handler
 * @param {Outfit object} outfit Outfit to be removed
 * @returns New outfits or an error message, if removing
 *          the outfit would remove needed resources from
 *          the build.
 */
export const removeOutfit = (e, outfit, build) => {
  // Check maximum number of outfits that coul be removed
  const max_outfit_number = maxOutfitsToRemove(build, outfit)
  // If there is no more room, return a message specifying
  // the limiting resource
  if (isNaN(max_outfit_number)) {
    return max_outfit_number
  }
    
  // Adjust amount if Shift and/or Ctrl were pressed
  var amount = 1
  e.shiftKey && (amount *= 5)
  e.ctrlKey && (amount *= 20)
  e.getModifierState('AltGraph') && (amount = max_outfit_number)

  // Make a temporary copy of the current build
  const newBuild = cloneDeep(build)
  
  // Adjust outfits
  const newOutfits = newBuild.outfits
  const outfit_set = newOutfits.find(outfit_set => outfit_set.outfit.id === outfit.id)
  // If the amount to remove is less than current outfits, decrease the amount accordingly
  if (outfit_set.amount > amount) {
    outfit_set.amount -= amount
  }
  else {
    // Remove outfit_set entirely
    newOutfits.splice(newOutfits.indexOf(outfit_set), 1)
  }
  // If new build is still valid, update outfits of current build
    return newOutfits    
}


/**
 * Checks that a build's outfit space, engine capacity, weapon capacity,
 * cargo space, and hard points are greater than 0.
 * 
 * @param {Build Object} build Build to be validated
 * @returns true if valid, false if not valid
 */
export const validateBuild = (build) => {
      // Calculate remaining outfit space
      const outfitSpace = getBuildAttribute(build, 'outfit_space')
      if (outfitSpace < 0) {
        console.log(`Not enough outfit space: ${outfitSpace}`)
        return false
      }
  
      // Calculate remaining engine capacity
      const engineCapacity = getBuildAttribute(build, 'engine_capacity')
      if (engineCapacity < 0) {
        console.log(`Not enough engine capacity: ${engineCapacity}`)
        return false
      }
  
      // Calculate remaining weapon capacity
      const weaponCapacity = getBuildAttribute(build, 'weapon_capacity')
      if (weaponCapacity < 0) {
        console.log(`Not enough weapon capacity: ${weaponCapacity}`)
        return false
      }
  
      // Calculate cargo space
      const cargoSpace = getBuildAttribute(build, 'cargo_space')
      if (cargoSpace < 0) {
        console.log(`Not enough cargo space: ${cargoSpace}`)
        return false
      }

      // Calculate gun ports
      const gunPorts = getBuildAttribute(build, 'gun_ports')
      if (gunPorts < 0) {
        console.log(`Not enough gun ports: ${gunPorts}`)
        return false
      }

      // Calculate turret mounts
      const turretMounts = getBuildAttribute(build, 'turret_mounts')  
      if (turretMounts < 0) {
        console.log(`Not enough turret mounts: ${turretMounts}`)
        return false
      }

      return true
}

/**
 * Formats a table with alternating striped rows,
 * where odd rows are colored and even rows remain
 * unchanged.
 * 
 * Rows with the class .nostripe will be ignored
 * 
 * @param {HTML table element} table Table to be striped
 */
export const stripe = (table) => {
  const rows = table.querySelectorAll("tr:not(.nostripe)")
  for (var i = 0; i < rows.length; i++) {
    if (i % 2 == 0) {
      rows[i].classList.add("bg-gray-500")
    }
    else {
      rows[i].classList.remove("bg-gray-500")
    }
  }
}