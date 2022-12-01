import React from 'react'

import { WeatherIcon } from './weather-icon'

const Loader = () => (
  <div className='loader'>
    <WeatherIcon icon='rain' size="4x" />
    <WeatherIcon icon='clear:day' size="4x" />
    <WeatherIcon icon='snow' size="4x" />
  </div>
)

export default Loader
