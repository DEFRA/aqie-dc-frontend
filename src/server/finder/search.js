export const searchFuntionlity = (totalResponse, sanitizedSearchQuery) => {
  let searchResonse = totalResponse
  if (sanitizedSearchQuery) {
    // Split search query by commas and trim whitespace, then filter out empty strings
    const lowerSearchQuery = sanitizedSearchQuery
      .trim()
      .split(',')
      .map((q) => q.trim())
      .filter((item) => item.length > 0)
      .map((q) => q.toLowerCase())

    searchResonse = totalResponse.filter((item) => {
      // Check if any of the relevant fields contain the search query
      return (
        lowerSearchQuery.some((name) =>
          item.name.toLowerCase().includes(name)
        ) ||
        lowerSearchQuery.some((manufacturer) =>
          item.manufacturer.toLowerCase().includes(manufacturer)
        ) ||
        lowerSearchQuery.some((modelNumber) =>
          item.modelNumber.toString().toLowerCase().includes(modelNumber)
        ) ||
        lowerSearchQuery.some((type) => item.type.toLowerCase().includes(type))
      )
    })
  }
  return searchResonse
}
