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

export const setLocationAndWeather = (queue, placeIdOrLatLng, isGeolocated) => {
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

    const locationRegex = /(forecast|standalone)\/?([0-9_-]+)?\/?([0-9_-]+)?/
    const match = window.location.pathname.match(locationRegex)
    const existingLocation = match && match[2] && match[3] && util.decodeLatLng({ lat: match[2], lng: match[3] })

    if (existingLocation && util.coordsMatch(existingLocation, newLocation)) {
      return getAndSetWeather(queue, newLocation).then(() => {
        return null
      })
    } else {
      queue.finish()

      return `/${(match && match[1]) || 'forecast'}/${util.encodeLatLng(newLocation)}`
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

export const setDefaultLocation = () => {
  const queue = Queue.create()

  if (!locationStore.recent.length) {
    return getAndSetUserLocation(queue)
  }

  return setLocationAndWeather(queue, locationStore.recent[0], false)
}

export const getAndSetUserLocation = (queue) => {
  locationStore.setLoadingUserLocation(true)
  locationStore.setError(null)

  const reset = () => {
    locationStore.setLoadingUserLocation(false)
  }

  queue.once('cancel', reset)

  return util.getUserLocation()
  .then((latLng) => {
    if (queue.canceled) return

    return setLocationAndWeather(queue, latLng, true)
  })
  .catch((error) => {
    if (queue.canceled) return

    locationStore.setError(error)
  })
  .finally(() => {
    if (!queue.canceled) reset()
  })
}

export const getAndSetWeather = async (queue, location, final = true) => {
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
  setLocationAndWeather(Queue.create(), locationStore.current)
}
