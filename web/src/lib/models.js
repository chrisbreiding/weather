import { types } from 'mobx-state-tree'
import moment from 'moment'

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
})
.views((self) => ({
  get hours () {
    const lastDayTimestamp = self.lastDayTimestamp
    return self.data.filter((hour) => {
      return hour.time <= lastDayTimestamp
    })
  },

  get days () {
    return self.hours
    .filter((hour) => {
      return moment.unix(hour.time).isSame(
        moment.unix(hour.time).startOf('day')
      )
    })
    .map((hour) => hour.time)
  },

  get chartData () {
    return self.hours.map((hour) => {
      return {
        time: hour.time,
        temp: Math.round(hour.temperature),
        apparentTemp: Math.round(hour.apparentTemperature),
        precipProbability: Math.round(hour.precipProbability * 100),
      }
    })
  },

  get firstDayTimestamp () {
    const earliestTime = Math.min(...self.data.map((hour) => hour.time))
    return moment.unix(earliestTime).startOf('day').unix()
  },

  get lastDayTimestamp () {
    const latestTime = Math.max(...self.data.map((hour) => hour.time))
    return moment.unix(latestTime).startOf('day').unix()
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

const Weather = types.model('Weather', {
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

  setError (err) {
    self.error = err
  },
}))

export default Weather.create()
