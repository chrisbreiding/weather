import dayjs from 'dayjs'
import { computed, makeObservable, observable } from 'mobx'
import type { IconName } from '../components/weather-icon'
import { toTenth } from './util'

export class NullDay {
  time: number
  icon = 'default' as const
  precipProbability = '--'
  precipAccumulation = '--'
  precipType = '--'
  temperatureLow = '--'
  temperatureHigh = '--'
  precipProbabilityPercent = '--'

  constructor (time: number) {
    this.time = time
  }
}

export class NullDailyWeather {
  days: NullDay[]
  lastDayIndex = 10

  constructor () {
    const start = dayjs().startOf('day').unix()
    const secondsInADay = 60 * 60 * 24

    this.days = Array.from({ length: 10 }).map((_, i) => {
      return new NullDay(start + i * secondsInADay)
    })
  }
}

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
  precipAccumulation: string
  precipType: string
  temperatureLow: number
  temperatureHigh: number

  constructor (props: DayProps) {
    this.time = props.time
    this.icon = props.icon
    this.precipProbability = props.precipProbability
    this.precipAccumulation = toTenth(props.precipAccumulation)
    this.precipType = props.precipType
    this.temperatureLow = Math.round(props.temperatureLow)
    this.temperatureHigh = Math.round(props.temperatureHigh)

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
  }

  get precipProbabilityPercent () {
    return Math.round(this.precipProbability * 100)
  }
}

export class DailyWeather {
  days: Day[]

  constructor ({ days }: { days: DayProps[] }) {
    this.days = days.map((dayProps) => new Day(dayProps))

    makeObservable(this, {
      days: observable,

      lastDayIndex: computed,
    })
  }

  get lastDayIndex () {
    return this.days.length
  }
}
