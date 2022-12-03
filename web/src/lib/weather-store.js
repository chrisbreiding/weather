import dayjs from 'dayjs'
import { types } from 'mobx-state-tree'

import { debugStore } from '../components/debug'
import { chartState } from './chart-state'
import { fetch } from './persistence'
import util from './util'

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
})
.views((self) => ({
  get hours () {
    return self.data
  },

  get days () {
    if (chartState.focusedDay) return []

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
    const hours = chartState.focusedDay ? self.hours.filter(isDay) : self.hours

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
    if (chartState.focusedDay) {
      return dayjs.unix(chartState.focusedDay).startOf('day').unix()
    }

    return self.weekStartTimestamp
  },

  get endTimestamp () {
    if (chartState.focusedDay) {
      return dayjs.unix(chartState.focusedDay).endOf('day').add(1, 'millisecond').unix()
    }

    return self.weekEndTimestamp
  },

  get weekStartTimestamp () {
    const earliestTime = Math.min(...self.hours.map((hour) => hour.time))

    return dayjs.unix(earliestTime).startOf('day').unix() + ((0 + chartState.startDayIndex) * 60 * 60 * 24)
  },

  get weekEndTimestamp () {
    const latestTime = Math.max(...self.hours.map((hour) => hour.time))

    return dayjs.unix(latestTime).startOf('day').unix() - ((10 - chartState.endDayIndex) * 60 * 60 * 24)
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
    return self.data
  },

  get lastDayIndex () {
    return self.days.length
  },
}))

const alertParagraphRegex = /(\*|\s\.\.\.|\.\.\.\s)/

const Alert = types.model('Alert', {
  title: types.string,
  messages: types.array(types.string),
  time: types.number,
  expires: types.number,
})
.views((self) => ({
  get descriptionParagraphs () {
    return self.messages
    .map((message) => {
      return message
      .split(alertParagraphRegex)
      .map((paragraph) => paragraph.trim().replace(/^\.\.?\.?/, ''))
      .filter((paragraph) => !!paragraph && paragraph !== '*' && paragraph !== '...')
    })
    .flat()
  },
}))

const str = (value) => JSON.stringify(value, null, 2)

const WeatherStore = types.model('WeatherStore', {
  alerts: types.array(Alert),
  currently: types.maybeNull(CurrentWeather),
  daily: types.maybeNull(DailyWeather),
  hourly: types.maybeNull(HourlyWeather),
  updatedTimestamp: 0,
  isLoading: true,
  // TODO: move to chartState? new uiState?
  error: types.maybeNull(types.string),
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
