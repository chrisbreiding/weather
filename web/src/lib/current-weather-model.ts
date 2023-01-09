import { computed, makeObservable, observable } from 'mobx'
import type { IconName } from '../components/weather-icon'

export class NullCurrentWeather {
  apparentTemperature = '--'
  icon = 'default' as const
  temperature = '--'
  precipProbabilityPercent = '--'
}

export interface CurrentWeatherProps {
  apparentTemperature: number
  icon: IconName
  precipProbability: number
  temperature: number
}

export class CurrentWeather {
  apparentTemperature: number
  icon: IconName
  precipProbability: number
  temperature: number

  constructor (props: CurrentWeatherProps) {
    this.apparentTemperature = Math.round(props.apparentTemperature)
    this.icon = props.icon
    this.precipProbability = props.precipProbability
    this.temperature = Math.round(props.temperature)

    makeObservable(this, {
      apparentTemperature: observable,
      icon: observable,
      precipProbability: observable,
      temperature: observable,

      precipProbabilityPercent: computed,
    })
  }

  get precipProbabilityPercent () {
    return Math.round(this.precipProbability * 100)
  }
}
