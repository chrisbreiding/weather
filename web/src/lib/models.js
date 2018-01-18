import { types } from 'mobx-state-tree'

export const CurrentWeatherModel = types.model('CurrentWeather', {
  summary: types.string,
  precipProbability: types.number,
  temperature: types.number,
  apparentTemperature: types.number,
  icon: types.string,
})

const HourModel = types.model('Hour', {
  time: types.number,
  precipProbability: types.number,
  temperature: types.number,
  apparentTemperature: types.number,
})

export const HourlyWeatherModel = types.model('HourlyWeather', {
  summary: types.string,
  data: types.array(HourModel),
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
