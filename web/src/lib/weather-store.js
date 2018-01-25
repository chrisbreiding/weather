import { types } from 'mobx-state-tree'
import moment from 'moment'

import util from './util'

export const CurrentlyWeather = types.model('CurrentWeather', {
  summary: types.string,
  precipProbability: types.number,
  temperature: types.number,
  apparentTemperature: types.number,
  icon: types.string,
})

const Hour = types.model('Hour', {
  time: types.number,
  precipProbability: types.number,
  temperature: types.number,
  apparentTemperature: types.number,
})

export const HourlyWeather = types.model('HourlyWeather', {
  data: types.array(Hour),
  focusedDay: types.maybe(types.number),
})
.views((self) => ({
  get hours () {
    const [start, end] = [self.startTimestamp, self.endTimestamp]
    return self.data.filter((hour) => {
      return hour.time >= start && hour.time <= end
    })
  },

  get days () {
    if (self.focusedDay) return []

    return self.hours
    .filter((hour) => {
      return moment.unix(hour.time).isSame(
        moment.unix(hour.time).startOf('day')
      )
    })
    .map((hour) => hour.time)
  },

  get chartData () {
    const [start, end] = [self.startTimestamp, self.endTimestamp]
    const isDay = (hour) => util.isBetween(hour.time, start, end)
    const hours = self.focusedDay ? self.hours.filter(isDay) : self.hours

    return hours.map((hour) => {
      return {
        time: hour.time,
        temp: Math.round(hour.temperature),
        apparentTemp: Math.round(hour.apparentTemperature),
        precipProbability: Math.round(hour.precipProbability * 100),
      }
    })
  },

  get startTimestamp () {
    if (self.focusedDay) {
      return moment.unix(self.focusedDay).startOf('day').unix()
    }

    return self.weekStartTimestamp
  },

  get endTimestamp () {
    if (self.focusedDay) {
      return moment.unix(self.focusedDay).endOf('day').add(1, 'millisecond').unix()
    }

    return self.weekEndTimestamp
  },

  get weekStartTimestamp () {
    const earliestTime = Math.min(...self.data.map((hour) => hour.time))
    return moment.unix(earliestTime).startOf('day').unix()
  },

  get weekEndTimestamp () {
    const latestTime = Math.max(...self.data.map((hour) => hour.time))
    return moment.unix(latestTime).startOf('day').unix()
  },
}))
.actions((self) => ({
  setFocusedDay (day) {
    self.focusedDay = day.time === self.focusedDay ? null : day.time
  },
}))

const Day = types.model('Day', {
  time: types.number,
  summary: types.string,
  icon: types.string,
  precipProbability: types.number,
  precipAccumulation: types.maybe(types.number),
  precipType: types.maybe(types.string),
  temperatureMin: types.number,
  temperatureMax: types.number,
})

const DailyWeather = types.model('DailyWeather', {
  data: types.array(Day),
})
.views((self) => ({
  get days () {
    return self.data.slice(0, 7)
  },
}))

const WeatherStore = types.model('WeatherStore', {
  isLoading: true,
  error: types.maybe(types.string),
  currently: types.maybe(CurrentlyWeather),
  hourly: types.maybe(HourlyWeather),
  daily: types.maybe(DailyWeather),
})
.actions((self) => ({
  update ({ currently, hourly, daily }) {
    self.currently = CurrentlyWeather.create(currently)
    self.hourly = HourlyWeather.create(hourly)
    self.daily = DailyWeather.create(daily)
    self.isLoading = false
  },

  setFocusedDay (day) {
    self.hourly.setFocusedDay(day)
  },

  setLoading (isLoading) {
    self.isLoading = isLoading
  },

  setError (error) {
    self.error = error && error.message ? error.message : error
  },
}))

export default WeatherStore.create()
