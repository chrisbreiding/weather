import cs from 'classnames'
import React from 'react'
import { observer } from 'mobx-react-lite'

import CurrentWeather from './current-weather'
import Days from './days'
import TempChart from './temp-chart'
import PrecipChart from './precip-chart'
import WindChart from './wind-chart'
import Loader from './loader'
import Radar from './radar'

const Weather = observer(({ locationStore, weatherStore }) => {
  if (!locationStore.hasCurrent) return null

  if (weatherStore.error) {
    return (
      <div className='weather-error'>
        <p>Could not retrieve weather data. The following error occurred:</p>
        <pre className='error-message'>{weatherStore.error}</pre>
      </div>
    )
  }

  if (weatherStore.isLoading) {
    return <Loader />
  }

  const setShowingRadar = (showingRadar) => () => {
    weatherStore.setShowingRadar(showingRadar)
  }

  const focusedDay = weatherStore.hourly.focusedDay
  const minWidth = focusedDay ? 375 : 600

  return (
    <div className={cs('weather', {
      'has-focused-day': !!focusedDay,
      'showing-radar': weatherStore.isShowingRadar,
    })}>
      <CurrentWeather
        currentLocation={locationStore.current}
        currentWeather={weatherStore.currently}
        onShowRadar={setShowingRadar(true)}
      />
      <div className='charts'>
        <Days
          hourlyWeather={weatherStore.hourly}
          dailyWeather={weatherStore.daily}
          onSelectDay={weatherStore.setFocusedDay}
        />
        <TempChart hourlyWeather={weatherStore.hourly} minWidth={minWidth} />
        <PrecipChart hourlyWeather={weatherStore.hourly} minWidth={minWidth} />
        <WindChart hourlyWeather={weatherStore.hourly} minWidth={minWidth} />
      </div>
      <Radar
        controls={true}
        location={locationStore.current}
        onClose={setShowingRadar(false)}
        zoom={10}
      />
    </div>
  )
})

export default Weather
