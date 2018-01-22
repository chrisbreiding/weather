import React from 'react'
import { observer } from 'mobx-react'

import CurrentWeather from './current-weather'
import Days from './days'
import TempChart from './temp-chart'
import PrecipChart from './precip-chart'
import Loader from './loader'

const Weather = observer(({ locationStore, weatherStore }) => {
  if (!locationStore.hasCurrent) return null

  if (weatherStore.error) {
    return (
      <div className='error'>
        <p>Could not retrieve weather data. The following error occurred:</p>
        <p className='error-message'>{weatherStore.error}</p>
      </div>
    )
  }

  if (weatherStore.isLoading) {
    return <Loader />
  }

  return (
    <div className='weather'>
      <CurrentWeather currentWeather={weatherStore.currently} />
      <Days hourlyWeather={weatherStore.hourly} dailyWeather={weatherStore.daily} />
      <TempChart hourlyWeather={weatherStore.hourly} />
      <PrecipChart hourlyWeather={weatherStore.hourly} />
      <p className='credit'>
        <a href='https://darksky.net/poweredby/' target='_blank' rel='noopener noreferrer'>Powered by Dark Sky</a>
      </p>
    </div>
  )
})

export default Weather
