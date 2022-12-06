import cs from 'classnames'
import React from 'react'
import type { CurrentWeather as CurrentWeatherModel } from '../lib/current-weather-model'

import { refreshWeather } from '../lib/data'
import type { Location } from '../lib/location-store'
import { Radar } from './radar'
import { WeatherIcon } from './weather-icon'

interface CurrentWeatherProps {
  currentLocation: Location
  currentWeather: CurrentWeatherModel
  onShowRadar: () => void
  updatedTimestamp: number
}

export const CurrentWeather = ({ currentLocation, currentWeather, onShowRadar, updatedTimestamp }: CurrentWeatherProps) => {
  const { temperature, apparentTemperature, icon, precipProbabilityPercent } = currentWeather

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
          <WeatherIcon iconName={icon} size='4x' onClick={refreshWeather} />
        </div>
        <div className='row'>
          <p className='apparent-temp'>Feels like {Math.round(apparentTemperature)}°F</p>
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
