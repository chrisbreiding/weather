import { useStrict } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { render } from 'react-dom'
import Icon from 'react-weathericons'
import FastClick from 'fastclick'

import api from './lib/api'
import util from './lib/util'
import weather from './lib/models'
import CurrentWeather from './components/current-weather'
import Days from './components/days'
import TempChart from './components/temp-chart'
import PrecipChart from './components/precip-chart'

new FastClick(document.body)
useStrict(true)

@observer
class App extends Component {
  render () {
    if (weather.error) {
      return (
        <div className='error'>
          <p>Could not retrieve weather data. The following error occurred:</p>
          <p className='error-message'>{weather.error}</p>
        </div>
      )
    }

    if (weather.isLoading) {
      return (
        <div className='loader'>
          <Icon name={util.icons.RAIN} className='icon rain' size="4x" />
          <Icon name={util.icons.SUN} className='icon sun' size="4x" />
          <Icon name={util.icons.SNOWFLAKE} className='icon snow' size="4x" />
        </div>
      )
    }

    return (
      <div className='container'>
        <CurrentWeather currentWeather={weather.currently} />
        <Days hourlyWeather={weather.hourly} dailyWeather={weather.daily} />
        <TempChart hourlyWeather={weather.hourly} />
        <PrecipChart hourlyWeather={weather.hourly} />
        <p className='credit'>
          <a href='https://darksky.net/poweredby/' target='_blank' rel='noopener noreferrer'>Powered by Dark Sky</a>
        </p>
      </div>
    )
  }

  componentDidMount () {
    api.getWeather()
    .then(this._updateWeather)
    .catch(this._handleError)
  }

  _updateWeather = ({ currently, hourly, daily }) => {
    weather.update({ currently, hourly, daily })
  }

  _handleError = (err) => {
    weather.setError(err && err.message ? err.message : err)
  }
}

render(<App />, document.getElementById('app'))
