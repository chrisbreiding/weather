import { getWeather, setLocation } from './data'
import locationStore from './location-store'
import util from './util'

import { Queue } from './queue'
import { debugStore } from '../components/debug'

const getLatestLocation = async (queue) => {
  const reset = () => {
    locationStore.setLoadingUserLocation(false)
  }

  queue.once('cancel', reset)

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

  if (locationStore.hasCurrent) {
    await getWeather(queue, locationStore.current, false)
  }

  await getLatestLocation(queue)

  queue.finish()
}
