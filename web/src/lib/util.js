import moment from 'moment'
import { debugStore } from '../components/debug'

const iconMap = {
  'clear-day:day': 'day-sunny',
  'clear-day:night': 'night-clear',
  'clear-night:day': 'day-sunny',
  'clear-night:night': 'night-clear',
  'rain': 'rain',
  'snow': 'snowflake-cold',
  'sleet': 'sleet',
  'wind': 'strong-wind',
  'fog': 'fog',
  'cloudy': 'cloud',
  'partly-cloudy-day:day': 'day-cloudy',
  'partly-cloudy-day:night': 'night-alt-cloudy',
  'partly-cloudy-night:day': 'day-cloudy',
  'partly-cloudy-night:night': 'night-alt-cloudy',
  'default': 'moon-new',
}

const roundCoord = (coord) => Math.round(coord * 100)
const nearlyEqual = (num1, num2) => {
  return Math.abs((Math.max(num1, num2) - Math.min(num1, num2))) < 10
}

const getWebUserLocation = () => {
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
        resolve(false)
      },
    )
  })
}

const getNativeUserLocation = () => {
  debugStore.log('get native user location')

  return new Promise((resolve) => {
    window.__onUserLocation = (location) => {
      window.__onUserLocation = undefined

      if (!location) {
        debugStore.log('getting location failed')

        resolve(false)

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

const fallbackCopyToClipboard = (text) => {
  let textArea = document.createElement('textarea')
  textArea.value = text

  // Avoid scrolling to bottom
  textArea.style.top = '0'
  textArea.style.left = '0'
  textArea.style.position = 'fixed'

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    document.execCommand('copy')
    // eslint-disable-next-line no-console
    console.log('succeeded copying to clipboard')
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('failed copying to clipboard:', error.stack)
  }

  document.body.removeChild(textArea)
}

const copyToClipboard = (text) => {
  if (!navigator.clipboard) {
    fallbackCopyToClipboard(text)
    return
  }

  navigator.clipboard.writeText(text)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('succeeded copying to clipboard (async)')
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.log('failed copying to clipboard (async):', error.stack)
  })
}

export default {
  copyToClipboard,
  nearlyEqual,

  coordsMatch ({ lat: lat1, lng: lng1 }, { lat: lat2, lng: lng2 }) {
    if (lat1 == null || lat2 == null || lng1 == null || lng2 == null) return false

    return (
      nearlyEqual(roundCoord(lat1), roundCoord(lat2)) &&
      nearlyEqual(roundCoord(lng1), roundCoord(lng2))
    )
  },

  currentTimestamp () {
    return moment().unix()
  },

  formatDateTime (timestamp) {
    return moment.unix(timestamp).format('ddd M/D h:mma')
  },

  formatTime (timestamp) {
    return moment.unix(timestamp).format('ha')
  },

  getNoonFromTimestamp (timestamp) {
    return moment.unix(timestamp).startOf('day').add(12, 'hours').unix()
  },

  getShortDisplayDateFromTimestamp (timestamp) {
    return moment.unix(timestamp).format('ddd M/D')
  },

  getDarkSkyIcon (icon, adjustForDayNight) {
    // dark sky specifies an icon for the worst weather of the day
    // this normalizes it so if it's current weather or today's forecast
    // it shows day during day and night during night
    // for the rest of the forecast, it shows day
    if (/(day|night)/.test(icon)) {
      if (adjustForDayNight) {
        const hours = moment().toObject().hours
        const isDay = hours > 6 && hours < 20
        icon += `:${isDay ? 'day' : 'night'}`
      } else {
        icon += ':day'
      }
    }

    return iconMap[icon] || iconMap.default
  },

  getUserLocation () {
    if (window.webkit?.messageHandlers?.bus) {
      return getNativeUserLocation()
    }

    return getWebUserLocation()
  },

  icons: {
    SUN: 'day-sunny',
    RAIN: 'rain',
    RAINDROP: 'raindrop',
    CLOUD: 'cloud',
    SNOW: 'snow',
    SNOWFLAKE: 'snowflake-cold',
  },

  isBetween (timestamp, start, end) {
    return moment.unix(timestamp).isBetween(moment.unix(start), moment.unix(end), null, '[]')
  },

  isSameDay (dayTimestamp, maybeSameDayTimestamp) {
    const date = moment.unix(dayTimestamp)
    const maybeSameDate = moment.unix(maybeSameDayTimestamp)
    return (
      date.isSame(maybeSameDate, 'day')
      || date.endOf('day').add(2, 'hour').isSame(maybeSameDate, 'hour')
    )
  },

  isStandalone () {
    return location.pathname === '/standalone' || window.navigator.standalone
  },

  isToday (timestamp) {
    return moment.unix(timestamp).isSame(moment(), 'day')
  },

  toTenth (num) {
    if (!num) return 0

    return (num).toFixed(1).replace('.0', '')
  },

  getAlertId (alert) {
    return `${alert.title}${alert.time}${alert.expires}`
  },
}
