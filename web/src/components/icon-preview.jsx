import React from 'react'
import { WeatherIcon } from './weather-icon'

export const IconPreview = () => (
  <div className='icon-preview'>
    <WeatherIcon icon='blizzard' fixedWidth size='5x' />
    <WeatherIcon icon='clear:day' fixedWidth size='5x' />
    <WeatherIcon icon='clear:night' fixedWidth size='5x' />
    <WeatherIcon icon='cloudy' fixedWidth size='5x' />
    <WeatherIcon icon='fog' fixedWidth size='5x' />
    <WeatherIcon icon='hot' fixedWidth size='5x' />
    <WeatherIcon icon='hurricane' fixedWidth size='5x' />
    <WeatherIcon icon='partly-cloudy:day' fixedWidth size='5x' />
    <WeatherIcon icon='partly-cloudy:night' fixedWidth size='5x' />
    <WeatherIcon icon='rain' fixedWidth size='5x' />
    <WeatherIcon icon='raindrop' fixedWidth size='5x' />
    <WeatherIcon icon='sleet' fixedWidth size='5x' />
    <WeatherIcon icon='snow' fixedWidth size='5x' />
    <WeatherIcon icon='storm' fixedWidth size='5x' />
    <WeatherIcon icon='tornado' full fixedWidth size='5x' />
    <WeatherIcon icon='wind' fixedWidth size='5x' />
    <WeatherIcon icon='default' fixedWidth size='5x' />
  </div>
)
