import { computed, makeObservable, observable } from 'mobx'
import type { IconName } from '../components/weather-icon'

export interface DayProps {
  time: number
  icon: IconName
  precipProbability: number
  precipAccumulation: number
  precipType: string
  temperatureLow: number
  temperatureHigh: number
}

export class Day {
  time: number
  icon: IconName
  precipProbability: number
  precipAccumulation: number
  precipType: string
  temperatureLow: number
  temperatureHigh: number

  constructor (props: DayProps) {
    makeObservable(this, {
      time: observable,
      icon: observable,
      precipProbability: observable,
      precipAccumulation: observable,
      precipType: observable,
      temperatureLow: observable,
      temperatureHigh: observable,

      precipProbabilityPercent: computed,
    })

    this.time = props.time
    this.icon = props.icon
    this.precipProbability = props.precipProbability
    this.precipAccumulation = props.precipAccumulation
    this.precipType = props.precipType
    this.temperatureLow = props.temperatureLow
    this.temperatureHigh = props.temperatureHigh
  }

  get precipProbabilityPercent () {
    return Math.round(this.precipProbability * 100)
  }
}

export class DailyWeather {
  days: Day[]

  constructor ({ days }: { days: DayProps[] }) {
    makeObservable(this, {
      days: observable,

      lastDayIndex: computed,
    })

    this.days = days.map((dayProps) => new Day(dayProps))
  }

  get lastDayIndex () {
    return this.days.length
  }
}
