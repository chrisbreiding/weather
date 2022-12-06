import { action, makeObservable, observable } from 'mobx'

import { debugStore } from '../components/debug'
import { Alert } from './alert-model'
import { CurrentWeather } from './current-weather-model'
import { DailyWeather } from './daily-weather-model'
import { HourlyWeather } from './hourly-weather-model'
import { fetch } from './persistence'
import type { SourceWeather } from './types'
import * as util from './util'

const str = (value: any) => JSON.stringify(value, null, 2)

export class WeatherStore {
  alerts: Alert[] = []
  currently?: CurrentWeather
  daily?: DailyWeather
  hourly?: HourlyWeather
  updatedTimestamp = 0
  isLoading = true

  // TODO: move to chartState? new uiState?
  error?: string
  isShowingRadar = false

  constructor () {
    makeObservable(this, {
      alerts: observable,
      currently: observable,
      daily: observable,
      hourly: observable,
      updatedTimestamp: observable,
      isLoading: observable,
      error: observable,
      isShowingRadar: observable,

      update: action,
      setLoading: action,
      setShowingRadar: action,
      setError: action,
    })
  }

  update ({ currently, hourly, daily, alerts = [] }: SourceWeather) {
    debugStore.log('currently:', str(currently))
    debugStore.log('hourly:', str(hourly))
    debugStore.log('daily:', str(daily))
    debugStore.log('alerts:', str(alerts))

    this.currently = new CurrentWeather(currently)
    this.hourly = new HourlyWeather({ hours: hourly.data })
    this.daily = new DailyWeather({ days: daily.data })
    this.isLoading = false

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

  setLoading (isLoading: boolean) {
    this.isLoading = isLoading
  }

  setShowingRadar (isShowingRadar: boolean) {
    this.isShowingRadar = isShowingRadar
  }

  setError (error?: string | { message: string }) {
    this.error = typeof error === 'object' && 'message' in error ? error.message : error
  }
}

export const weatherStore = new WeatherStore()
const lastLoadedWeather = fetch<'lastLoadedWeather'>('lastLoadedWeather')

// @ts-ignore
window.setWeather = action(() => {
  weatherStore.currently!.temperature = 20
})

if (util.isStandalone() && lastLoadedWeather) {
  debugStore.log('load last weather')
  weatherStore.update(lastLoadedWeather)
}
