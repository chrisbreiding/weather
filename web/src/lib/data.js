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

  return getLocationDetails(placeIdOrLatLng)
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
      return getWeather(queue, newLocation)
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

  return api.getWeather(location.toString())
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

const getWeatherForLastLocation = async (queue, reset) => {
  if (!locationStore.hasCurrent) return

  try {
    debugStore.log('get weather for last known location')

    weatherStore.setError(null)

    const weatherData = await api.getWeather(locationStore.current.toString())
    // if the user location has changed, it will load the weather for the
    // new location, so don't update the weather for the old location here
    if (queue.canceled) {
      debugStore.log('got weather, but queue canceled')

      return
    }

    save('lastLoadedWeather', weatherData)

    debugStore.log('update weather for last known location')

    weatherStore.update(weatherData)
  } catch (error) {
  // ignore the error, let location load and get weather again
    debugStore.log('getting weather errored')
  }

  if (!queue.canceled) reset()
}

const getLatestLocation = async (queue, reset) => {
  try {
    debugStore.log('get user location')

    locationStore.setLoadingUserLocation(true)
    locationStore.setError(null)

    const latLng = await util.getUserLocation()

    if (queue.canceled) {
      debugStore.log('got user location, but queue canceled')

      return
    }

    // if the location is the same as the last one and we've already loaded
    // the latest weather below, don't do it again here
    if (
      locationStore.hasCurrent
      && util.coordsMatch(locationStore.current, latLng)
    ) {
      debugStore.log('got user location, but location is the same and already loaded weather')

      if (!queue.canceled) reset()

      return
    }

    debugStore.log('set user location')

    await setLocation(queue, latLng, true)
  } catch (error) {
    debugStore.log('getting user location errored')

    // already have location saved, so don't display error
    if (queue.canceled || locationStore.hasCurrent) return

    locationStore.setError(error)
  }

  if (!queue.canceled) reset()
}

// in standalone mode, we load the last known location and weather so that
// it doesn't show a loading animation. then we load the weather for the
// last known location so it's up-to-date, since getting the latest location
// can take several seconds. then we load the latest location and update the
// weather for it if it's different from the previous location
export const getInitialWeather = async () => {
  const queue = Queue.create()

  const resetLocation = () => locationStore.setLoadingUserLocation(false)
  const resetWeather = () => weatherStore.setLoading(false)
  const resetAll = () => {
    resetLocation()
    resetWeather()
  }

  queue.on('cancel', resetAll)

  await getWeatherForLastLocation(queue, resetWeather)
  await getLatestLocation(queue, resetLocation)

  queue.finish()
}
