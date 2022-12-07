import type { AlertProps } from './alert-model'
import type { CurrentWeatherProps } from './current-weather-model'
import type { DayProps } from './daily-weather-model'
import type { HourProps } from './hourly-weather-model'

declare global {
  interface Window {
    __onMessage?: (message: string) => void
    __onUserLocation?: (location?: { latitude: number, longitude: number }) => void
    webkit: {
      messageHandlers: {
        bus: {
          postMessage: (message: any) => void
        }
      }
    }
  }

  interface Navigator {
    standalone?: boolean
  }
}

export interface LatLng {
  lat: number
  lng: number
}

export interface PlaceIdObject {
  placeId: string
}

export type PlaceIdOrLatLng = PlaceIdObject | LatLng

export interface LocationProps {
  description: string
  isGeolocated: boolean
  lat: number
  lng: number
  placeId: string
}

export type LocationCache = { [key: string]: LocationProps }

export interface DebugLogProps {
  datetime: string
  messages: string[]
}

export interface SourceWeather {
  alerts: AlertProps[]
  currently: CurrentWeatherProps
  daily: {
    data: DayProps[]
  }
  hourly: {
    data: HourProps[]
  }
}
