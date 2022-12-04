import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { setLocationAndWeather } from '../lib/data'
import locationStore from '../lib/location-store'
import { Queue } from '../lib/queue'
import util from '../lib/util'
import { debugStore } from './debug'

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

    return setLocationAndWeather(queue, latLng, true).then((path) => {
      if (!queue.canceled) reset()

      return path
    })
  } catch (error) {
    debugStore.log('getting user location errored')

    // already have location saved, so don't display error
    if (queue.canceled || locationStore.hasCurrent) return

    locationStore.setError(error)
  }
}

// in standalone mode, load the last known location and weather so that
// it doesn't show a loading animation. then load the weather for the
// last known location so it's up-to-date, since getting the latest location
// can take several seconds. then load the latest location and update the
// weather for it if it's different from the previous location
export const Standalone = () => {
  const navigate = useNavigate()

  const getInitialWeather = async () => {
    const queue = Queue.create()

    if (locationStore.hasCurrent) {
      navigate(`/standalone/${util.encodeLatLng(locationStore.current)}`)
    }

    const path = await getLatestLocation(queue)

    if (path) {
      navigate(path)
    }

    queue.finish()
  }

  useEffect(() => {
    let initialRun = true

    // receives messages from the iOS wrapper
    window.__onMessage = (message) => {
      debugStore.log(`got message: ${message}`)
      if (message === 'didBecomeActive' && !initialRun) {
        getInitialWeather()
      }
    }

    getInitialWeather().then(() => {
      initialRun = false
    })
  }, [true])

  return (
    <Outlet />
  )
}
