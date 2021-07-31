import { configure as configureMobx } from 'mobx'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { render } from 'react-dom'
import FastClick from 'fastclick'

import { getWeather, setUserLocation } from './lib/data'
import eventBus from './lib/event-bus'
import router from './lib/router'
import locationStore from './lib/location-store'
import weatherStore from './lib/weather-store'
import util from './lib/util'

import { DebugLogs, debugStore } from './components/debug'
import { Queue } from './lib/queue'
import Footer from './components/footer'
import Header from './components/header'
import Weather from './components/weather'

new FastClick(document.body)
configureMobx({ enforceActions: 'always' })

const getUserLocation = () => {
  setUserLocation(Queue.create())
}

if (util.isStandalone()) {
  debugStore.log('is standalone')

  window.__onMessage = (message) => {
    debugStore.log(`got message: ${message}`)
    if (message === 'didBecomeActive') {
      getUserLocation()
    }
  }

  getUserLocation()
} else {
  router.init()
}

setInterval(() => {
  if (locationStore.hasCurrent) {
    debugStore.log('refresh weather')
    getWeather(Queue.create(), locationStore.current)
  }
}, 1000 * 60) // 1 minute

const App = observer(() => (
  <div className='app' onClick={() => eventBus.emit('global:click')}>
    <Header locationStore={locationStore} weatherStore={weatherStore} />
    <Weather locationStore={locationStore} weatherStore={weatherStore} />
    {!weatherStore.isLoading && <Footer />}
    <DebugLogs />
  </div>
))

render(<App />, document.getElementById('app'))
