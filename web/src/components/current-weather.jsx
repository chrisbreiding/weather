import cs from 'classnames'
import React from 'react'
import WeatherIcon from 'react-weathericons'

import Radar from './radar'
import { refreshWeather } from '../lib/data'
import util from '../lib/util'

const CurrentWeather = ({ currentLocation, currentWeather, onShowRadar }) => {
  const { temperature, apparentTemperature, icon, summary, precipProbabilityPercent } = currentWeather

  return (
    <div className={cs('current', {
      'lower-apparent': apparentTemperature < temperature,
      'higher-apparent': apparentTemperature > temperature,
    })}>
      <div>
        <div className='row'>
          <p className='temp'>
            {Math.round(temperature)}
            <span className='degrees'>°F</span>
          </p>
          <p>
            <WeatherIcon
              className='icon'
              name={util.getDarkSkyIcon(icon, true)}
              onClick={refreshWeather}
            />
          </p>
        </div>
        <div className='row'>
          <p className='apparent-temp'>Feels like {Math.round(apparentTemperature)}°F</p>
          <p className='summary'>{summary}</p>
        </div>
        <p className='precip'>{precipProbabilityPercent}% chance of precip.</p>
      </div>
      <Radar location={currentLocation} onOpen={onShowRadar} />
    </div>
  )
}

export default CurrentWeather
