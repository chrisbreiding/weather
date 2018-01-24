import { useStrict } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'
import { render } from 'react-dom'
import FastClick from 'fastclick'

import eventBus from './lib/event-bus'
import router from './lib/router'
import locationStore from './lib/location-store'
import weatherStore from './lib/weather-store'

import Location from './components/location'
import Weather from './components/weather'

new FastClick(document.body)
useStrict(true)

const oldSetRoute = router.setRoute.bind(router)
router.setRoute = (...args) => {
  if (window.onpopstate) {
    oldSetRoute(...args)
  } else {
    setTimeout(() => {
      router.setRoute(...args)
    }, 10)
  }
}

router.init()

const App = observer(() => (
  <div className='app' onClick={() => eventBus.emit('global:click')}>
    <Location locationStore={locationStore} />
    <Weather locationStore={locationStore} weatherStore={weatherStore} />
  </div>
))

render(<App />, document.getElementById('app'))
