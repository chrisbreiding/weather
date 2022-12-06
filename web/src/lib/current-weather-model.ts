import { computed, makeObservable, observable } from 'mobx'
import type { IconName } from '../components/weather-icon'

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
    makeObservable(this, {
      apparentTemperature: observable,
      icon: observable,
      precipProbability: observable,
      temperature: observable,

      precipProbabilityPercent: computed,
    })

    this.apparentTemperature = props.apparentTemperature
    this.icon = props.icon
    this.precipProbability = props.precipProbability
    this.temperature = props.temperature
  }

  get precipProbabilityPercent () {
    return Math.round(this.precipProbability * 100)
  }
}
