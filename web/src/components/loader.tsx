import React from 'react'

import { WeatherIcon } from './weather-icon'

export const Loader = () => (
  <div className='loader'>
    <WeatherIcon iconName='rain' size="4x" />
    <WeatherIcon iconName='clear:day' size="4x" />
    <WeatherIcon iconName='snow' size="4x" />
  </div>
)
