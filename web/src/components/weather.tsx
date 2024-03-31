import cs from 'classnames'
import React from 'react'
import { observer } from 'mobx-react-lite'

import { chartState } from '../lib/chart-state'

import { CurrentWeather } from './current-weather'
import { Days } from './days'
import { PrecipChart } from './precip-chart'
import { Radar } from './radar'
import { TempChart } from './temp-chart'
import { WindChart } from './wind-chart'
import type { LocationStore } from '../lib/location-store'
import type { WeatherStore } from '../lib/weather-store'

interface WeatherProps {
  locationStore: LocationStore
  weatherStore: WeatherStore
}

export const Weather = observer(({ locationStore, weatherStore }: WeatherProps) => {
  if (weatherStore.error) {
    return (
      <div className='weather-error'>
        <p>Could not retrieve weather data. The following error occurred:</p>
        <pre className='error-message'>{weatherStore.error}</pre>
      </div>
    )
  }

  const setShowingRadar = (showingRadar: boolean) => () => {
    weatherStore.setShowingRadar(showingRadar)
  }

  return (
    <div className={cs('weather', {
      'has-focused-day': chartState.hasFocusedDay,
      'showing-radar': weatherStore.isShowingRadar,
      'is-loading': chartState.isLoading,
    })}>
      <CurrentWeather
        currentLocation={locationStore.current}
        currentWeather={weatherStore.currently}
        updatedTimestamp={weatherStore.updatedTimestamp}
        onShowRadar={setShowingRadar(true)}
      />
      <div className='charts'>
        <Days dailyWeather={weatherStore.daily} />
        <TempChart hourlyWeather={weatherStore.hourly} />
        <PrecipChart hourlyWeather={weatherStore.hourly} />
        <WindChart hourlyWeather={weatherStore.hourly} />
      </div>
      <Radar
        controls={true}
        location={locationStore.current!}
        onClose={setShowingRadar(false)}
        zoom={10}
      />
    </div>
  )
})
