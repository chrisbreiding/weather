import api from './api'
import router from './router'
import locationStore from './location-store'
import weatherStore from './weather-store'
import util from './util'

const searchLocations = (query) => {
  return api.searchLocations(query).catch((error) => {
    locationStore.setError(error)
    return []
  })
}

const getLocationDetails = (placeIdOrLatLng) => {
  const existing = locationStore.getLocationFromCache(placeIdOrLatLng)

  return existing ? Promise.resolve(existing) : api.getLocationDetails(placeIdOrLatLng)
}

const setLocation = (placeIdOrLatLng, isGeolocated) => {
  locationStore.setLoading(true)
  locationStore.setError(null)
  getLocationDetails(placeIdOrLatLng)
  .then((location) => {
    if (!location) return

    location.isGeolocated = isGeolocated

    locationStore.setLoading(false)
    const newLocation = locationStore.setCurrent(location)

    const path = `/forecast/${newLocation.lat}/${newLocation.lng}`
    if (path === window.location.pathname) {
      getWeather(newLocation)
    } else {
      router.setRoute(path)
    }
  })
  .catch((error) => {
    locationStore.setError(error)
    locationStore.setLoading(false)
  })
}

const setUserLocation = () => {
  locationStore.setLoading(true)
  locationStore.setError(null)
  util.getUserLocation()
  .then((latLng) => {
    setLocation(latLng, true)
  })
  .catch((error) => {
    locationStore.setError(error)
    locationStore.setLoading(false)
  })
}

const getWeather = (location) => {
  weatherStore.setLoading(true)
  weatherStore.setError(null)
  api.getWeather(location.toString())
  .then(({ currently, hourly, daily }) => {
    weatherStore.update({ currently, hourly, daily })
  })
  .catch((error) => {
    weatherStore.setError(error)
    weatherStore.setLoading(false)
  })
}

export default {
  searchLocations,
  setLocation,
  setUserLocation,
  getWeather,
}
