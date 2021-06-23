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
    if (util.isStandalone() || path === window.location.pathname) {
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

const setDefaultLocation = () => {
  if (!locationStore.recent.length) {
    return setUserLocation()
  }

  setLocation(locationStore.recent[0], false)
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
  weatherStore.setError(null)
  api.getWeather(location.toString())
  .then((data) => {
    weatherStore.update(data)
  })
  .catch((error) => {
    weatherStore.setError(error)
    weatherStore.setLoading(false)
  })
}

const refreshWeather = () => {
  setLocation(locationStore.current)
}

export default {
  searchLocations,
  setLocation,
  setDefaultLocation,
  setUserLocation,
  getWeather,
  refreshWeather,
}
