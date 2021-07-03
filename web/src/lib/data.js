import api from './api'
import router from './router'
import locationStore from './location-store'
import weatherStore from './weather-store'
import util from './util'

export const searchLocations = (query) => {
  locationStore.setSearchingLocations(true)

  return api.searchLocations(query)
  .catch((error) => {
    locationStore.setError(error)
    return []
  })
  .finally(() => {
    locationStore.setSearchingLocations(false)
  })
}

const getLocationDetails = (placeIdOrLatLng) => {
  const existing = locationStore.getLocationFromCache(placeIdOrLatLng)

  return existing ? Promise.resolve(existing) : api.getLocationDetails(placeIdOrLatLng)
}

export const setLocation = (placeIdOrLatLng, isGeolocated) => {
  if (!placeIdOrLatLng) return

  locationStore.setLoadingLocationDetails(true)
  locationStore.setError(null)
  getLocationDetails(placeIdOrLatLng)
  .then((location) => {
    if (!location) return

    location.isGeolocated = isGeolocated

    locationStore.setLoadingLocationDetails(false)
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
    locationStore.setLoadingLocationDetails(false)
  })
}

export const setDefaultLocation = () => {
  if (!locationStore.recent.length) {
    return setUserLocation()
  }

  setLocation(locationStore.recent[0], false)
}

export const setUserLocation = () => {
  locationStore.setLoadingUserLocation(true)
  locationStore.setError(null)

  util.getUserLocation()
  .then((latLng) => {
    setLocation(latLng, true)
  })
  .catch((error) => {
    locationStore.setError(error)
  })
  .finally(() => {
    locationStore.setLoadingUserLocation(false)
  })
}

export const getWeather = (location) => {
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

export const refreshWeather = () => {
  setLocation(locationStore.current)
}
