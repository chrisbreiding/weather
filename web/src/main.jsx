import { configure as configureMobx } from 'mobx'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { render } from 'react-dom'
import FastClick from 'fastclick'

import data from './lib/data'
import eventBus from './lib/event-bus'
import router from './lib/router'
import locationStore from './lib/location-store'
import weatherStore from './lib/weather-store'
import util from './lib/util'

import Location from './components/location'
import Weather from './components/weather'

new FastClick(document.body)
configureMobx({ enforceActions: 'always' })

if (util.isStandalone()) {
  window.__onMessage = (message) => {
    if (message === 'didBecomeActive') {
      data.setUserLocation()
    }
  }

  data.setUserLocation()
} else {
  router.init()
}

setInterval(() => {
  if (locationStore.hasCurrent) {
    data.getWeather(locationStore.current)
  }
}, 1000 * 60) // 1 minute

const App = observer(() => (
  <div className='app' onClick={() => eventBus.emit('global:click')}>
    <Location locationStore={locationStore} />
    <Weather locationStore={locationStore} weatherStore={weatherStore} />
  </div>
))

render(<App />, document.getElementById('app'))
