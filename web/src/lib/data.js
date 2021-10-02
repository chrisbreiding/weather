import api from './api'
import router from './router'
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

  getLocationDetails(placeIdOrLatLng)
  .then((location) => {
    if (!location || queue.canceled) {
      debugStore.location(!location ? 'no location details found' : 'got location details, but queue canceled')

      return
    }

    location.isGeolocated = isGeolocated
    reset()

    const newLocation = locationStore.setCurrent(location)
    const path = `/forecast/${newLocation.lat}/${newLocation.lng}`

    if (util.isStandalone()) {
      save('lastLoadedLocation', location)
    }

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

  debugStore.log('get weather')

  weatherStore.setError(null)
  api.getWeather(location.toString())
  .then((data) => {
    if (queue.canceled) {
      debugStore.log('got weather, but queue canceled')

      return
    }

    if (util.isStandalone()) {
      save('lastLoadedWeather', data)
    }

    debugStore.log('update weather')

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

// in standalone mode, we load the last known location and weather so that
// it doesn't show a loading animation. then we load the user's current
// location and update the weather based on that. getting the user location
// can take several seconds, but loading weather is generally fast, so we
// refresh the weather for the last known location in parallel, but then
// update the weather for the latest location if it's different
export const getInitialWeather = () => {
  const queue = Queue.create()
  let loadedLatestWeather = false
  let cancelLatestWeather = false

  locationStore.setLoadingUserLocation(true)
  locationStore.setError(null)

  const resetLocation = () => locationStore.setLoadingUserLocation(false)
  const resetWeather = () => weatherStore.setLoading(false)

  const resetAll = () => {
    resetLocation()
    resetWeather()
  }

  queue.on('cancel', resetAll)

  debugStore.log('(a) get user location')

  util.getUserLocation()
  .then((latLng) => {
    if (queue.canceled) {
      debugStore.log('(a) got user location, but queue canceled')

      return
    }

    // if the location is the same as the last one and we've already loaded
    // the latest weather below, don't do it again here
    if (
      locationStore.hasCurrent
      && util.coordsMatch(locationStore.current, latLng)
      && loadedLatestWeather
    ) {
      debugStore.log('(a) got user location, but location is the same and already loaded weather')

      return
    }

    cancelLatestWeather = true

    debugStore.log('(a) set user location')

    setLocation(queue, latLng, true)
  })
  .catch((error) => {
    debugStore.log('(a) getting user location errored')

    // already have location saved, so don't display error
    if (queue.canceled || locationStore.hasCurrent) return

    locationStore.setError(error)
  })
  .finally(() => {
    if (!queue.canceled) resetLocation()
  })

  if (!locationStore.hasCurrent) return

  debugStore.log('(b) get weather for last known location')

  weatherStore.setError(null)
  api.getWeather(locationStore.current.toString())
  .then((data) => {
    // if the user location has changed, it will load the weather for the
    // new location, so don't update the weather for the old location here
    if (queue.canceled || cancelLatestWeather) {
      debugStore.log(`(b) got weather, but ${queue.canceled ? 'queue canceled' : 'got new location'}`)

      return
    }

    loadedLatestWeather = true

    save('lastLoadedWeather', data)

    debugStore.log('(b) update weather for last known location')

    weatherStore.update(data)
  })
  .catch(() => {
    // ignore the error, let location load and get weather again
    debugStore.log('(b) getting weather errored')
  })
  .finally(() => {
    if (!queue.canceled) resetWeather()
  })
}
