import { configure as configureMobx } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
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

if (!util.isStandalone()) {
  router.init()
}

@observer
class App extends Component {
  render () {
    return (
      <div className='app' onClick={() => eventBus.emit('global:click')}>
        <Location locationStore={locationStore} />
        <Weather locationStore={locationStore} weatherStore={weatherStore} />
      </div>
    )
  }

  componentDidMount () {
    if (util.isStandalone()) {
      data.setUserLocation()
    }
  }
}

render(<App />, document.getElementById('app'))
