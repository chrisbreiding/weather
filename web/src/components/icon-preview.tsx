import cs from 'classnames'
import React, { useState } from 'react'
import { WeatherIcon, WeatherIconProps } from './weather-icon'

const Icon = (props: WeatherIconProps) => (
  <div className='icon-box'>
    <WeatherIcon {...props} />
  </div>
)

export const IconPreview = () => {
  const [showingBorders, setShowingBorders] = useState(false)

  function toggle () {
    setShowingBorders(!showingBorders)
  }

  return (
    <div className={cs('icon-preview', { 'showing-borders': showingBorders })}>
      <header>
        <button onClick={toggle}>Toggle borders</button>
      </header>
      <main>
        <Icon iconName='blizzard' size='5x' />
        <Icon iconName='clear:day' size='5x' />
        <Icon iconName='clear:night' size='5x' />
        <Icon iconName='cloudy' size='5x' />
        <Icon iconName='fog' size='5x' />
        <Icon iconName='hot' size='5x' />
        <Icon iconName='hurricane' size='5x' />
        <Icon iconName='partly-cloudy:day' size='5x' />
        <Icon iconName='partly-cloudy:night' size='5x' />
        <Icon iconName='rain' size='5x' />
        <Icon iconName='raindrop' size='5x' />
        <Icon iconName='sleet' size='5x' />
        <Icon iconName='snow' size='5x' />
        <Icon iconName='snowflake' size='5x' />
        <Icon iconName='storm' size='5x' />
        <Icon iconName='tornado' size='5x' />
        <Icon iconName='wind' size='5x' />
        <Icon iconName='default' size='5x' />
      </main>
    </div>
  )
}
