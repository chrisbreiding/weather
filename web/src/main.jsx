import { useStrict } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { render } from 'react-dom'
import FastClick from 'fastclick'

import api from './lib/api'
import eventBus from './lib/event-bus'
import startRouter from './lib/routing'
import locationStore from './lib/location-store'
import weatherStore from './lib/weather-store'

import Location from './components/location'
import Weather from './components/weather'

new FastClick(document.body)
useStrict(true)
startRouter()

@observer
class App extends Component {
  render () {
    return (
      <div className='app' onClick={() => eventBus.emit('global:click')}>
        <Location locationStore={locationStore} onChange={this._getWeather} />
        <Weather locationStore={locationStore} weatherStore={weatherStore} />
      </div>
    )
  }

  _getWeather = () => {
    weatherStore.setLoading(true)
    api.getWeather(locationStore.current.toString())
    .then(({ currently, hourly, daily }) => {
      weatherStore.update({ currently, hourly, daily })
    })
    .catch(this._handleWeatherError)
  }

  _handleWeatherError = (error) => {
    weatherStore.setError({ error })
  }
}

render(<App />, document.getElementById('app'))
