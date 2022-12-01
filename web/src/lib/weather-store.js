import { types } from 'mobx-state-tree'
import dayjs from 'dayjs'

import util from './util'
import { fetch } from './persistence'
import { debugStore } from '../components/debug'

export const CurrentWeather = types.model('CurrentWeather', {
  precipProbability: types.optional(types.number, 0),
  temperature: types.number,
  apparentTemperature: types.number,
  icon: types.string,
})
.views((self) => ({
  get precipProbabilityPercent () {
    return Math.round(self.precipProbability * 100)
  },
}))

const Hour = types.model('Hour', {
  time: types.number,
  precipIntensity: types.number,
  precipProbability: types.optional(types.number, 0),
  precipType: types.maybeNull(types.string),
  temperature: types.number,
  apparentTemperature: types.number,
  windSpeed: types.number,
})

export const HourlyWeather = types.model('HourlyWeather', {
  data: types.array(Hour),
  focusedDay: types.maybeNull(types.number),
})
.views((self) => ({
  get hours () {
    // add an hour so the final day ends on 12am
    return self.data.slice(weatherStore.startDayIndex * 24, weatherStore.endDayIndex * 24 + 1)
  },

  get days () {
    if (self.focusedDay) return []

    return self.hours
    .filter((hour) => {
      return dayjs.unix(hour.time).isSame(
        dayjs.unix(hour.time).startOf('day'),
      )
    })
    .map((hour) => hour.time)
  },

  get chartData () {
    const [start, end] = [self.startTimestamp, self.endTimestamp]
    const isDay = (hour) => util.isBetween(hour.time, start, end)
    const hours = self.focusedDay ? self.hours.filter(isDay) : self.hours

    return hours.map((hour) => {
      const isSnow = hour.precipType === 'snow'
      const precipProbability = Math.round(hour.precipProbability * 100)

      const isLowIntensity = !isSnow && hour.precipIntensity < 0.07
      const isMediumIntensity = !isSnow && (hour.precipIntensity >= 0.07 && hour.precipIntensity < 0.14)
      const isHighIntensity = !isSnow && (hour.precipIntensity >= 0.14 && hour.precipIntensity < 0.21)
      const isVeryHighIntensity = !isSnow && hour.precipIntensity >= 0.21

      return {
        time: hour.time,
        temp: Math.round(hour.temperature),
        apparentTemp: Math.round(hour.apparentTemperature),
        precipProbability: isSnow ? 0 : precipProbability,
        lowPrecipProbability: isLowIntensity ? precipProbability : 0,
        mediumPrecipProbability: isMediumIntensity ? precipProbability : 0,
        highPrecipProbability: isHighIntensity ? precipProbability : 0,
        veryHighPrecipProbability: isVeryHighIntensity ? precipProbability : 0,
        snowProbability: isSnow ? precipProbability : 0,
        precipSnowProbability: precipProbability,
        windSpeed: hour.windSpeed,
      }
    })
  },

  get startTimestamp () {
    if (self.focusedDay) {
      return dayjs.unix(self.focusedDay).startOf('day').unix()
    }

    return self.weekStartTimestamp
  },

  get endTimestamp () {
    if (self.focusedDay) {
      return dayjs.unix(self.focusedDay).endOf('day').add(1, 'millisecond').unix()
    }

    return self.weekEndTimestamp
  },

  get weekStartTimestamp () {
    const earliestTime = Math.min(...self.hours.map((hour) => hour.time))

    return dayjs.unix(earliestTime).startOf('day').unix()
  },

  get weekEndTimestamp () {
    const latestTime = Math.max(...self.data.map((hour) => hour.time))

    return dayjs.unix(latestTime).startOf('day').unix()
  },
}))
.actions((self) => ({
  setFocusedDay (day) {
    self.focusedDay = day.time === self.focusedDay ? null : day.time
  },
}))

const Day = types.model('Day', {
  time: types.number,
  icon: types.string,
  precipProbability: types.number,
  precipAccumulation: types.maybeNull(types.number),
  precipType: types.maybeNull(types.string),
  temperatureLow: types.number,
  temperatureHigh: types.number,
})
.views((self) => ({
  get precipProbabilityPercent () {
    return Math.round(self.precipProbability * 100)
  },
}))

const DailyWeather = types.model('DailyWeather', {
  data: types.array(Day),
})
.views((self) => ({
  get days () {
    return self.data.slice(weatherStore.startDayIndex, weatherStore.endDayIndex)
  },
}))

const alertParagraphRegex = /(\*|\s\.\.\.|\.\.\.\s)/

const Alert = types.model('Alert', {
  title: types.string,
  description: types.string,
  time: types.number,
  expires: types.number,
})
.views((self) => ({
  get descriptionParagraphs () {
    return (self.description || '')
    .split(alertParagraphRegex)
    .map((paragraph) => paragraph.trim().replace(/^\.\.?\.?/, ''))
    .filter((paragraph) => !!paragraph && paragraph !== '*' && paragraph !== '...')
  },
}))

const str = (value) => JSON.stringify(value, null, 2)

const WeatherStore = types.model('WeatherStore', {
  alerts: types.array(Alert),
  currently: types.maybeNull(CurrentWeather),
  daily: types.maybeNull(DailyWeather),
  error: types.maybeNull(types.string),
  hourly: types.maybeNull(HourlyWeather),
  updatedTimestamp: 0,
  isLoading: true,
  isShowingRadar: false,
})
.actions((self) => ({
  update ({ currently, hourly, daily, alerts = [] }) {
    debugStore.log('currently:', str(currently))
    debugStore.log('hourly:', str(hourly))
    debugStore.log('daily:', str(daily))
    debugStore.log('alerts:', str(alerts))

    self.currently = CurrentWeather.create(currently)
    self.hourly = HourlyWeather.create(hourly)
    self.daily = DailyWeather.create(daily)
    self.isLoading = false
    const alertIds = {}

    // dedupe alerts
    alerts = alerts.filter((alert) => {
      const id = util.getAlertId(alert)

      if (alertIds[id]) return false

      alertIds[id] = true

      return true
    })
    self.alerts = alerts.map((alert) => Alert.create(alert))

    self.updatedTimestamp = Date.now()
  },

  setFocusedDay (day) {
    self.hourly.setFocusedDay(day)
  },

  setLoading (isLoading) {
    self.isLoading = isLoading
  },

  setShowingRadar (isShowingRadar) {
    self.isShowingRadar = isShowingRadar
  },

  setError (error) {
    self.error = error && error.message ? error.message : error
  },
}))

const weatherStore = WeatherStore.create({ alerts: [] })
const lastLoadedWeather = fetch('lastLoadedWeather')

if (util.isStandalone() && lastLoadedWeather) {
  debugStore.log('load last weather')
  weatherStore.update(lastLoadedWeather)
}

export default weatherStore
