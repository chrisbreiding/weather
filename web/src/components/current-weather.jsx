import cs from 'classnames'
import React from 'react'
import Icon from '@fortawesome/react-fontawesome'

import util from '../lib/util'

const CurrentWeather = ({ currentWeather }) => {
  const { temperature, apparentTemperature, icon, summary, precipProbability } = currentWeather

  return (
    <div className={cs('current', {
      'show-apparent': temperature !== apparentTemperature,
      'higher-apparent': apparentTemperature > temperature,
    })}>
      <div className='row'>
        <p className='temp'>
          {Math.round(temperature)}
          <span className='degrees'>°F</span>
        </p>
        <Icon className='icon' icon={util.getDarkSkyIcon(icon)} size="4x" />
      </div>
      <div className='row'>
        <p className='apparent-temp'>Feels like {Math.round(apparentTemperature)}°F</p>
        <p className='summary'>{summary}</p>
      </div>
      <p className='precip'>{precipProbability * 100}% chance of precipitation</p>
    </div>
  )
}

export default CurrentWeather
