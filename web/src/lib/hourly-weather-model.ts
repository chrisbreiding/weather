import { computed, makeObservable, observable } from 'mobx'
import dayjs from 'dayjs'
import { chartState } from './chart-state'
import { isBetween } from './util'

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
    makeObservable(this, {
      apparentTemperature: observable,
      precipIntensity: observable,
      precipProbability: observable,
      precipType: observable,
      temperature: observable,
      time: observable,
      windSpeed: observable,
    })

    this.apparentTemperature = props.apparentTemperature
    this.precipIntensity = props.precipIntensity
    this.precipProbability = props.precipProbability
    this.precipType = props.precipType
    this.temperature = props.temperature
    this.time = props.time
    this.windSpeed = props.windSpeed
  }
}

export class HourlyWeather {
  hours: Hour[]

  constructor ({ hours }: { hours: HourProps[] }) {
    makeObservable(this, {
      hours: observable,

      days: computed,
      chartData: computed,
      startTimestamp: computed,
      endTimestamp: computed,
      weekStartTimestamp: computed,
      weekEndTimestamp: computed,
    })

    this.hours = hours.map((hourProps) => new Hour(hourProps))
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
