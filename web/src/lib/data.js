import api from './api'
import router from './router'
import locationStore from './location-store'
import weatherStore from './weather-store'
import util from './util'
import { Queue } from './queue'

export const searchLocations = (queue, query) => {
  locationStore.setSearchingLocations(true)

  const reset = () => {
    locationStore.setSearchingLocations(false)
  }

  queue.on('cancel', reset)

  return api.searchLocations(query)
  .catch((error) => {
    if (!queue.canceled) {
      locationStore.setError(error)
    }

    return []
  })
  .finally(() => {
    if (!queue.canceled) reset()
  })
}

const getLocationDetails = (placeIdOrLatLng) => {
  const existing = locationStore.getLocationFromCache(placeIdOrLatLng)

  return existing ? Promise.resolve(existing) : api.getLocationDetails(placeIdOrLatLng)
}

export const setLocation = (queue, placeIdOrLatLng, isGeolocated) => {
  if (!placeIdOrLatLng) {
    queue.finish()

    return
  }

  locationStore.setLoadingLocationDetails(true)
  locationStore.setError(null)

  const reset = () => {
    locationStore.setLoadingLocationDetails(false)
  }

  getLocationDetails(placeIdOrLatLng)
  .then((location) => {
    if (!location || queue.canceled) return

    location.isGeolocated = isGeolocated
    reset()

    const newLocation = locationStore.setCurrent(location)
    const path = `/forecast/${newLocation.lat}/${newLocation.lng}`

    if (util.isStandalone() || path === window.location.pathname) {
      getWeather(queue, newLocation)
    } else {
      queue.finish()
      router.setRoute(path)
    }
  })
  .catch((error) => {
    if (!queue.canceled) {
      queue.finish()
      locationStore.setError(error)
    }

    reset()
  })
}

export const setDefaultLocation = (queue) => {
  if (!locationStore.recent.length) {
    return setUserLocation(queue)
  }

  setLocation(queue, locationStore.recent[0], false)
}

export const setUserLocation = (queue) => {
  locationStore.setLoadingUserLocation(true)
  locationStore.setError(null)

  const reset = () => {
    locationStore.setLoadingUserLocation(false)
  }

  queue.on('cancel', reset)

  util.getUserLocation()
  .then((latLng) => {
    if (queue.canceled) return

    setLocation(queue, latLng, true)
  })
  .catch((error) => {
    if (queue.canceled) return

    locationStore.setError(error)
  })
  .finally(() => {
    if (!queue.canceled) reset()
  })
}

export const getWeather = (queue, location) => {
  const reset = () => {
    weatherStore.setLoading(false)
  }

  queue.on('cancel', reset)

  weatherStore.setError(null)
  api.getWeather(location.toString())
  .then((data) => {
    if (queue.canceled) return

    queue.finish()
    weatherStore.update(data)
  })
  .catch((error) => {
    if (!queue.canceled) {
      queue.finish()
      weatherStore.setError(error)
    }
  })
  .finally(reset)
}

export const refreshWeather = () => {
  setLocation(Queue.create(), locationStore.current)
}
