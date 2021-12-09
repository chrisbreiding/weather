import { debugStore } from '../components/debug'

const BASE_URL = localStorage.apiUrl
  ? localStorage.apiUrl
  : /local/.test(location.hostname)
    ? `http://${location.hostname}:3333`
    : 'https://proxy.crbapps.com'

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

const request = (url) => {
  debugStore.log('request', url)

  return fetch(url)
  .then((response) => response.json())
  .then(handleResponseError)
}

export default {
  searchLocations (query) {
    return request(`${BASE_URL}/location-search?query=${query}`)
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

    return request(url + (byLatLng ? `?latlng=${placeIdOrLatLng.lat},${placeIdOrLatLng.lng}` : `?placeid=${placeIdOrLatLng}`))
    .then((result) => {
      result = byLatLng ? result.results[0] : result.result

      const location = result.geometry.location
      return {
        placeId: result.place_id,
        description: result.formatted_address.replace(', USA', ''),
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
    // Date.now() ensures the response isn't cached
    return request(`${BASE_URL}/weather?location=${location}&z=${Date.now()}`)
    .catch((err) => {
      console.error('Getting weather failed:', err.stack) // eslint-disable-line no-console
      throw err
    })
  },
}
