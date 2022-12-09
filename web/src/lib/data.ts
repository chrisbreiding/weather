import { debugStore } from '../components/debug'
import {
  getLocationDetails as getRemoteLocationDetails,
  getWeather,
  LocationResult,
  searchLocations as searchRemoteLocations,
} from './api'
import { Location, locationStore } from './location-store'
import { save } from './persistence'
import { Queue } from './queue'
import { coordsMatch, getUserLocation, isStandalone } from './util'
import type { PlaceIdOrLatLng } from './types'
import { weatherStore } from './weather-store'

export function searchLocations (queue: Queue, query: string) {
  locationStore.setSearchingLocations(true)

  const reset = () => {
    locationStore.setSearchingLocations(false)
  }

  queue.once('cancel', reset)

  return searchRemoteLocations(query)
  .catch((error) => {
    if (!queue.canceled) {
      locationStore.setError(error)
    }

    return [] as LocationResult[]
  })
  .finally(() => {
    if (!queue.canceled) reset()
  })
}

function getLocationDetails (placeIdOrLatLng: PlaceIdOrLatLng) {
  const existing = locationStore.getLocationFromCache(placeIdOrLatLng)

  return existing ? Promise.resolve(existing) : getRemoteLocationDetails(placeIdOrLatLng)
}

export async function setLocationAndWeather (queue: Queue, placeIdOrLatLng?: PlaceIdOrLatLng, isGeolocated = false) {
  if (!placeIdOrLatLng) {
    debugStore.log('no location, do not try to set')

    queue.finish()

    return
  }

  locationStore.setLoadingLocationDetails(true)
  locationStore.setError(undefined)

  const reset = () => {
    locationStore.setLoadingLocationDetails(false)
  }

  debugStore.log('get location details')

  try {
    const location = await getLocationDetails(placeIdOrLatLng)

    if (!location || queue.canceled) {
      debugStore.log(location ? 'got location details, but queue canceled' : 'no location details found')

      return
    }

    location.isGeolocated = isGeolocated
    reset()

    const newLocation = locationStore.setCurrent(location)

    if (isStandalone()) {
      save('lastLoadedLocation', location)
    }

    const locationRegex = /(forecast|standalone)\/?([0-9.-]+)?\/?([0-9.-]+)?/
    const match = window.location.pathname.match(locationRegex)
    const existingLocation = match && match[2] && match[3] && {
      lat: Number(match[2]),
      lng: Number(match[3]),
    }

    if (existingLocation && coordsMatch(existingLocation, newLocation)) {
      return getAndSetWeather(queue, newLocation)
    } else {
      queue.finish()

      const { lat, lng } = newLocation

      return `/${(match && match[1]) || 'forecast'}/${lat}/${lng}`
    }
  } catch (error: any) {
    if (!queue.canceled) {
      queue.finish()
      locationStore.setError(error)
    }
  } finally {
    reset()
  }
}

export const setDefaultLocation = () => {
  const queue = Queue.create()

  if (!locationStore.recent.length) {
    return getAndSetUserLocation(queue)
  }

  return setLocationAndWeather(queue, locationStore.recent[0], false)
}

export const getAndSetUserLocation = (queue: Queue) => {
  locationStore.setLoadingUserLocation(true)
  locationStore.setError(undefined)

  const reset = () => {
    locationStore.setLoadingUserLocation(false)
  }

  queue.once('cancel', reset)

  return getUserLocation()
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

export const getAndSetWeather = async (queue: Queue, location: Location, final = true) => {
  const reset = () => {
    weatherStore.setLoading(false)
  }

  queue.once('cancel', reset)

  debugStore.log('get weather for', location.toString())

  weatherStore.setError(undefined)

  try {
    const data = await getWeather(location.toString())

    if (queue.canceled) {
      debugStore.log('got weather, but queue canceled')

      return
    }

    if (isStandalone()) {
      save('lastLoadedWeather', data)
    }

    debugStore.log('update weather')

    if (final) {
      queue.finish()
    }

    weatherStore.update(data)
  } catch (error: any) {
    debugStore.log('getting weather errored', error.stack)

    if (queue.canceled) return

    if (final) {
      queue.finish()
      weatherStore.setError(error)
    }
  } finally {
    if (!queue.canceled) reset()
  }
}

export function refreshWeather (queue?: Queue) {
  if (!locationStore.current) return

  return getAndSetWeather(queue || Queue.create(), locationStore.current)
}
