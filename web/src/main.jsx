import cs from 'classnames'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import FastClick from 'fastclick'
import { configure as configureMobx } from 'mobx'
import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import { getInitialWeather } from './lib/get-initial-weather'
import eventBus from './lib/event-bus'
import locationStore from './lib/location-store'
import weatherStore from './lib/weather-store'
import util from './lib/util'

import { DebugLogs, debugStore } from './components/debug'
import Footer from './components/footer'
import Header from './components/header'
import Weather from './components/weather'

dayjs.extend(isBetween)
new FastClick(document.body)
configureMobx({ enforceActions: 'always' })

const isStandalone = util.isStandalone()

debugStore.log('iStandalone?', isStandalone)

let initialRun = true

// receives messages from the iOS wrapper
window.__onMessage = (message) => {
  debugStore.log(`got message: ${message}`)
  if (message === 'didBecomeActive' && !initialRun) {
    getInitialWeather()
  }
}

const App = observer(() => {
  useEffect(() => {
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
      {!weatherStore.isLoading && <Footer />}
      <DebugLogs />
    </div>
  )
})

createRoot(document.getElementById('app')).render(<App />)
