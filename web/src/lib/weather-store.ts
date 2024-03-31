import { action, makeObservable, observable } from 'mobx'

import { debugStore, stringify } from '../components/debug'
import { Alert } from './alert-model'
import { CurrentWeather, NullCurrentWeather } from './current-weather-model'
import { DailyWeather, NullDailyWeather } from './daily-weather-model'
import { HourlyWeather, NullHourlyWeather } from './hourly-weather-model'
import { fetch } from './persistence'
import type { SourceWeather } from './types'
import { isStandalone } from './util'

export class WeatherStore {
  alerts: Alert[] = []
  currently: CurrentWeather | NullCurrentWeather
  daily: DailyWeather | NullDailyWeather
  error?: string
  hourly: HourlyWeather | NullHourlyWeather
  isShowingRadar = false
  updatedTimestamp = 0

  constructor () {
    this.currently = new NullCurrentWeather()
    this.daily = new NullDailyWeather()
    this.hourly = new NullHourlyWeather()

    makeObservable(this, {
      alerts: observable,
      currently: observable,
      daily: observable,
      hourly: observable,
      updatedTimestamp: observable,
      error: observable,
      isShowingRadar: observable,

      update: action,
      setShowingRadar: action,
      setError: action,
    })
  }

  update ({ currently, hourly, daily, alerts = [] }: SourceWeather) {
    debugStore.log('currently:', stringify(currently))
    debugStore.log('hourly:', stringify(hourly))
    debugStore.log('daily:', stringify(daily))
    debugStore.log('alerts:', stringify(alerts))

    this.currently = new CurrentWeather(currently)
    this.hourly = new HourlyWeather({ hours: hourly.data })
    this.daily = new DailyWeather({ days: daily.data })

    const alertIds: { [key: string]: boolean } = {}

    this.alerts = alerts
    .map((alertProps) => new Alert(alertProps))
    // dedupe alerts
    .filter((alert) => {
      if (alertIds[alert.id]) return false

      alertIds[alert.id] = true

      return true
    })

    this.updatedTimestamp = Date.now()
  }

  setShowingRadar (isShowingRadar: boolean) {
    this.isShowingRadar = isShowingRadar
  }

  setError (error?: string | { message: string }) {
    this.error = typeof error === 'object' && 'message' in error ? error.message : error
  }
}

export const weatherStore = new WeatherStore()
const lastLoadedWeather = fetch('lastLoadedWeather')

if (isStandalone() && lastLoadedWeather) {
  debugStore.log('load last weather')
  weatherStore.update(lastLoadedWeather)
}
