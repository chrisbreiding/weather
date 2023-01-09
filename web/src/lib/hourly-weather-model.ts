import { computed, makeObservable, observable } from 'mobx'
import dayjs from 'dayjs'
import { chartState } from './chart-state'
import { isBetween } from './util'

class NullHour {
  time: number
  temp: number
  apparentTemp: number
  precipProbability: number
  lowPrecipProbability: number
  mediumPrecipProbability: number
  highPrecipProbability: number
  veryHighPrecipProbability: number
  snowProbability: number
  precipSnowProbability: number
  windSpeed: number

  constructor (time: number) {
    this.time = time
    this.temp = 0
    this.apparentTemp = 0
    this.precipProbability = 0
    this.lowPrecipProbability = 0
    this.mediumPrecipProbability = 0
    this.highPrecipProbability = 0
    this.veryHighPrecipProbability = 0
    this.snowProbability = 0
    this.precipSnowProbability = 0
    this.windSpeed = 0
  }
}

export class NullHourlyWeather {
  days: number[]
  chartData: NullHour[]
  startTimestamp: number
  endTimestamp: number

  constructor () {
    const start = dayjs().startOf('day').unix()
    const secondsInAnHour = 60 * 60
    const secondsInADay = secondsInAnHour * 24

    this.days = Array.from({ length: 10 }).map((_, i) => {
      return start + i * secondsInADay
    })
    this.chartData = Array.from({ length: 10 * 24 }).map((_, i) => {
      return new NullHour(start + i * secondsInAnHour)
    })
    this.startTimestamp = start
    this.endTimestamp = start + secondsInADay * 10
  }
}

export interface HourProps {
  apparentTemperature: number
  precipIntensity: number
  precipProbability: number
  precipType: string
  temperature: number
  time: number
  windSpeed: number
}

class Hour {
  apparentTemperature: number
  precipIntensity: number
  precipProbability: number
  precipType: string
  temperature: number
  time: number
  windSpeed: number

  constructor (props: HourProps) {
    this.apparentTemperature = props.apparentTemperature
    this.precipIntensity = props.precipIntensity
    this.precipProbability = props.precipProbability
    this.precipType = props.precipType
    this.temperature = props.temperature
    this.time = props.time
    this.windSpeed = props.windSpeed

    makeObservable(this, {
      apparentTemperature: observable,
      precipIntensity: observable,
      precipProbability: observable,
      precipType: observable,
      temperature: observable,
      time: observable,
      windSpeed: observable,
    })
  }
}

export class HourlyWeather {
  hours: Hour[]

  constructor ({ hours }: { hours: HourProps[] }) {
    this.hours = hours.map((hourProps) => new Hour(hourProps))

    makeObservable(this, {
      hours: observable,

      days: computed,
      chartData: computed,
      startTimestamp: computed,
      endTimestamp: computed,
      weekStartTimestamp: computed,
      weekEndTimestamp: computed,
    })
  }

  get days () {
    if (chartState.focusedDay) return []

    return this.hours
    .filter((hour) => {
      return dayjs.unix(hour.time).isSame(
        dayjs.unix(hour.time).startOf('day'),
      )
    })
    .map((hour) => hour.time)
  }

  get chartData () {
    const [start, end] = [this.startTimestamp, this.endTimestamp]
    const isDay = (hour: Hour) => isBetween(hour.time, start, end)
    const hours = chartState.focusedDay ? this.hours.filter(isDay) : this.hours

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
  }

  get startTimestamp () {
    if (chartState.focusedDay) {
      return dayjs.unix(chartState.focusedDay).startOf('day').unix()
    }

    return this.weekStartTimestamp
  }

  get endTimestamp () {
    if (chartState.focusedDay) {
      return dayjs.unix(chartState.focusedDay).endOf('day').add(1, 'millisecond').unix()
    }

    return this.weekEndTimestamp
  }

  get weekStartTimestamp () {
    const earliestTime = Math.min(...this.hours.map((hour) => hour.time))

    return dayjs.unix(earliestTime).startOf('day').unix() + ((0 + chartState.startDayIndex) * 60 * 60 * 24)
  }

  get weekEndTimestamp () {
    const latestTime = Math.max(...this.hours.map((hour) => hour.time))

    return dayjs.unix(latestTime).startOf('day').unix() - ((10 - chartState.endDayIndex) * 60 * 60 * 24)
  }
}
