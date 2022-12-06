import dayjs from 'dayjs'
import { debugStore } from '../components/debug'
import type { LatLng } from './types'

function roundCoord (coord: number) {
  return Math.round(coord * 100)
}

export function nearlyEqual (num1: number, num2: number) {
  return Math.abs((Math.max(num1, num2) - Math.min(num1, num2))) < 10
}

function getWebUserLocation (): Promise<LatLng | undefined> {
  debugStore.log('get web user location')

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (err) => {
        // eslint-disable-next-line
        console.log('Unable to get current position:', err)
        resolve(undefined)
      },
    )
  })
}

function getNativeUserLocation (): Promise<LatLng | undefined> {
  debugStore.log('get native user location')

  return new Promise((resolve) => {
    window.__onUserLocation = (location) => {
      window.__onUserLocation = undefined

      if (!location) {
        debugStore.log('getting location failed')

        resolve(undefined)

        return
      }

      debugStore.log(`user location: ${location.latitude},${location.longitude}`)

      resolve({
        lat: location.latitude,
        lng: location.longitude,
      })
    }

    window.webkit.messageHandlers.bus.postMessage('get:user:location')
  })
}

export async function copyToClipboard (text: string) {
  try {
    await navigator.clipboard.writeText(text)

    // eslint-disable-next-line no-console
    console.log('succeeded copying to clipboard (async)')
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.log('failed copying to clipboard (async):', error.stack)
  }
}

export function coordsMatch ({ lat: lat1, lng: lng1 }: Partial<LatLng> = {}, { lat: lat2, lng: lng2 }: Partial<LatLng> = {}) {
  if (lat1 == null || lat2 == null || lng1 == null || lng2 == null) return false

  return (
    nearlyEqual(roundCoord(lat1), roundCoord(lat2)) &&
    nearlyEqual(roundCoord(lng1), roundCoord(lng2))
  )
}

export function currentTimestamp () {
  return dayjs().unix()
}

export function formatDateTime (timestamp: number) {
  return dayjs.unix(timestamp).format('ddd M/D h:mma')
}

export function formatTime (timestamp: number) {
  return dayjs.unix(timestamp).format('ha')
}

export function getNoonFromTimestamp (timestamp: number) {
  return dayjs.unix(timestamp).startOf('day').add(12, 'hours').unix()
}

export function getShortDisplayDateFromTimestamp (timestamp: number) {
  return dayjs.unix(timestamp).format('ddd M/D')
}

export function getUserLocation () {
  if (window.webkit?.messageHandlers?.bus) {
    return getNativeUserLocation()
  }

  return getWebUserLocation()
}

export function isBetween (timestamp: number, start: number, end: number) {
  return dayjs.unix(timestamp).isBetween(dayjs.unix(start), dayjs.unix(end), null, '[]')
}

export function isSameDay (dayTimestamp: number, maybeSameDayTimestamp: number) {
  const date = dayjs.unix(dayTimestamp)
  const maybeSameDate = dayjs.unix(maybeSameDayTimestamp)

  return (
    date.isSame(maybeSameDate, 'day')
    || date.endOf('day').add(2, 'hour').isSame(maybeSameDate, 'hour')
  )
}

export function isStandalone () {
  return !!(location.pathname.includes('standalone') || window.navigator.standalone)
}

export function isToday (timestamp: number) {
  return dayjs.unix(timestamp).isSame(dayjs(), 'day')
}

export function toTenth (num: number) {
  if (!num) return '0'

  return (num).toFixed(1).replace('.0', '')
}

export function toHundredth (num: number) {
  if (!num) return '0'

  return (num).toFixed(2).replace('.00', '').replace(/0$/, '')
}
