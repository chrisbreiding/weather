import cs from 'classnames'
import React, { useEffect } from 'react'

import { getInitialWeather } from '../lib/get-initial-weather'
import eventBus from '../lib/event-bus'
import locationStore from '../lib/location-store'
import util from '../lib/util'
import weatherStore from '../lib/weather-store'

import { DebugLogs, debugStore } from './debug'
import Footer from './footer'
import Header from './header'
import Weather from './weather'

const isStandalone = util.isStandalone()

export const App = () => {
  useEffect(() => {
    debugStore.log('iStandalone?', isStandalone)

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
    <div
      className={cs('app', { 'is-standalone': isStandalone })}
      onClick={() => eventBus.emit('global:click')}
    >
      <Header locationStore={locationStore} weatherStore={weatherStore} />
      <Weather locationStore={locationStore} weatherStore={weatherStore} />
      <Footer weatherStore={weatherStore} />
      <DebugLogs />
    </div>
  )
}
