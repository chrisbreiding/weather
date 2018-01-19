import { types } from 'mobx-state-tree'

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
    .filter((hour) => new Date(hour.time * 1000).getHours() === 23)
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
    const date = new Date(earliestTime * 1000)
    const hoursInSeconds = date.getHours() * 60 * 60
    const minutesInSeconds = date.getMinutes() * 60
    const secondsInSeconds = date.getSeconds()
    return earliestTime - hoursInSeconds - minutesInSeconds - secondsInSeconds
  },

  get lastDayTimestamp () {
    const latestTime = Math.max(...self.data.map((hour) => hour.time))
    const date = new Date(latestTime * 1000)
    const hoursInSeconds = date.getHours() * 60 * 60
    const minutesInSeconds = date.getMinutes() * 60
    const secondsInSeconds = date.getSeconds()
    return latestTime - hoursInSeconds - minutesInSeconds - secondsInSeconds - 60 * 60
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
