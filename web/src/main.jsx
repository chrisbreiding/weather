import { action, observable, useStrict } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { render } from 'react-dom'
import Icon from '@fortawesome/react-fontawesome'
import FastClick from 'fastclick'

import api from './lib/api'
import util from './lib/util'
import { CurrentWeatherModel, HourlyWeatherModel } from './lib/models'
import CurrentWeather from './components/current-weather'
import Days from './components/days'
import TempChart from './components/temp-chart'
import PrecipChart from './components/precip-chart'

new FastClick(document.body)
useStrict(true)

@observer
class App extends Component {
  @observable currentWeather
  @observable hourlyWeather
  @observable error

  render () {
    if (!this.currentWeather || !this.hourlyWeather) {
      return (
        <div className='loader'>
          <Icon icon={util.icons.SUN} className='icon sun' size="4x" spin />
          <Icon icon={util.icons.RAIN} className='icon rain' size="4x" />
          <Icon icon={util.icons.SNOWFLAKE} className='icon snowflake' size="4x" spin />
        </div>
      )
    }

    if (this.error) {
      return (
        <div className='error'>
          <p>Could not retrieve weather data. The following error occurred:</p>
          <pre>{this.error}</pre>
        </div>
      )
    }

    return (
      <div className='container'>
        <CurrentWeather currentWeather={this.currentWeather} />
        <Days hourlyWeather={this.hourlyWeather} />
        <TempChart hourlyWeather={this.hourlyWeather} />
        <PrecipChart hourlyWeather={this.hourlyWeather} />
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

  @action _updateWeather = ({ currently, hourly }) => {
    this.currentWeather = CurrentWeatherModel.create({
      summary: currently.summary,
      precipProbability: currently.precipProbability,
      temperature: currently.temperature,
      apparentTemperature: currently.apparentTemperature,
      icon: currently.icon,
    })
    this.hourlyWeather = HourlyWeatherModel.create({
      summary: hourly.summary,
      data: hourly.data,
    })
  }

  @action _handleError = (err) => {
    this.error = err && err.message ? err.message : err
  }
}

render(<App />, document.getElementById('app'))
