import api from './api'
import locationStore from './location-store'
import weatherStore from './weather-store'
import util from './util'
import { Queue } from './queue'
import { save } from './persistence'
import { debugStore } from '../components/debug'

export const searchLocations = (queue, query) => {
  locationStore.setSearchingLocations(true)

  const reset = () => {
    locationStore.setSearchingLocations(false)
  }

  queue.once('cancel', reset)

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
    debugStore.log('no location, do not try to set')

    queue.finish()

    return
  }

  locationStore.setLoadingLocationDetails(true)
  locationStore.setError(null)

  const reset = () => {
    locationStore.setLoadingLocationDetails(false)
  }

  debugStore.log('get location details')

  return getLocationDetails(placeIdOrLatLng)
  .then((location) => {
    if (!location || queue.canceled) {
      debugStore.location(!location ? 'no location details found' : 'got location details, but queue canceled')

      return
    }

    location.isGeolocated = isGeolocated
    reset()

    const newLocation = locationStore.setCurrent(location)

    if (util.isStandalone()) {
      save('lastLoadedLocation', location)
    }

    return getWeather(queue, newLocation)
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

  queue.once('cancel', reset)

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

export const getWeather = async (queue, location, final = true) => {
  const reset = () => {
    weatherStore.setLoading(false)
  }

  queue.once('cancel', reset)

  debugStore.log('get weather for', location.toString())

  weatherStore.setError(null)

  try {
    const data = await api.getWeather(location.toString())

    if (queue.canceled) {
      debugStore.log('got weather, but queue canceled')

      return
    }

    if (util.isStandalone()) {
      save('lastLoadedWeather', data)
    }

    debugStore.log('update weather')

    if (final) {
      queue.finish()
    }

    weatherStore.update(data)
  } catch (error) {
    debugStore.log('getting weather errored', error.stack)

    if (queue.canceled) return

    if (final) {
      queue.finish()
      weatherStore.setError(error)
    }
  }

  if (!queue.canceled) reset()
}

export const refreshWeather = () => {
  setLocation(Queue.create(), locationStore.current)
}
