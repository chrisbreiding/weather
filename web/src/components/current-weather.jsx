import cs from 'classnames'
import React from 'react'

import { refreshWeather } from '../lib/data'
import Radar from './radar'
import { WeatherIcon } from './weather-icon'

const CurrentWeather = ({ currentLocation, currentWeather, onShowRadar, updatedTimestamp }) => {
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
            <WeatherIcon darkSkyIcon={icon} size='4x' onClick={refreshWeather} />
          </p>
        </div>
        <div className='row'>
          <p className='apparent-temp'>Feels like {Math.round(apparentTemperature)}°F</p>
          <p className='summary'>{summary}</p>
        </div>
        <p className='precip'>{precipProbabilityPercent}% chance of precip.</p>
      </div>
      <Radar
        location={currentLocation}
        updatedTimestamp={updatedTimestamp}
        onOpen={onShowRadar}
      />
    </div>
  )
}

export default CurrentWeather
