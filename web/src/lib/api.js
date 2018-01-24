const BASE_URL = 'http://localhost:3333'

const handleResponseError = (response) => {
  if (!response.error) return response

  if (response.error.message) {
    throw Object.assign(new Error(response.error.message), response.error)
  } else if (typeof response.error === 'string') {
    throw new Error(response.error)
  } else {
    throw new Error(`Unexpected error: ${response.error}`)
  }
}

export default {
  searchLocations (query) {
    return fetch(`${BASE_URL}/location-search?query=${query}`)
    .then((response) => response.json())
    .then(handleResponseError)
    .then((response) => response.predictions.map((prediction) => ({
      description: prediction.description,
      placeId: prediction.place_id,
    })))
    .catch((err) => {
      console.error('Getting location failed:', err.stack) // eslint-disable-line no-console
      throw err
    })
  },

  getLocationDetails (placeIdOrLatLng) {
    let url = `${BASE_URL}/location-details`

    const byLatLng = !!placeIdOrLatLng.lat

    return fetch(url + (byLatLng ? `?latlng=${placeIdOrLatLng.lat},${placeIdOrLatLng.lng}` : `?placeid=${placeIdOrLatLng}`))
    .then((response) => response.json())
    .then(handleResponseError)
    .then((result) => {
      result = byLatLng ? result.results[0] : result.result

      const location = result.geometry.location
      return {
        placeId: result.place_id,
        _description: result.formatted_address.replace(', USA', ''),
        lat: location.lat,
        lng: location.lng,
      }
    })
    .catch((err) => {
      console.error('Getting location failed:', err.stack) // eslint-disable-line no-console
      throw err
    })
  },

  getWeather (location) {
    return fetch(`${BASE_URL}/weather?location=${location}`)
    .then((response) => response.json())
    .then(handleResponseError)
    .catch((err) => {
      console.error('Getting weather failed:', err.stack) // eslint-disable-line no-console
      throw err
    })
  },
}
