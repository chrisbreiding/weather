import React from 'react'

import { WeatherIcon } from './weather-icon'

const Loader = () => (
  <div className='loader'>
    <WeatherIcon iconName='RAIN' size="4x" />
    <WeatherIcon iconName='SUN' size="4x" />
    <WeatherIcon iconName='SNOW' size="4x" />
  </div>
)

export default Loader
