import {
  faSun,
  faMoon,
  faUmbrella,
  faSnowflake,
  faSchilx,
  faMixcloud,
  faSoundcloud,
  faCloud,
  faCircle,
} from '@fortawesome/fontawesome-pro-light'

const iconMap = {
  'clear-day': faSun,
  'clear-night': faMoon,
  'rain': faUmbrella,
  'snow': faSnowflake,
  'sleet': faSchilx,
  'wind': faMixcloud,
  'fog': faSoundcloud,
  'cloudy': faCloud,
  'partly-cloudy-day': faCloud,
  'partly-cloudy-night': faCloud,
  'default': faCircle,
}

export default {
  currentTimestamp () {
    return Math.floor(new Date().valueOf() / 1000)
  },

  getNoonFromTimestamp (timestamp) {
    return timestamp - 12 * 60 * 60
  },

  getShortDisplayDateFromTimestamp (timestamp) {
    const date = new Date(timestamp * 1000)
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
    const month = date.getMonth() + 1
    const monthDate = date.getDate()
    return `${day} ${month}/${monthDate}`
  },

  getDarkSkyIcon (icon) {
    return iconMap[icon] || iconMap.default
  },

  formatTime (timestamp) {
    const hours = new Date(timestamp * 1000).getHours()
    const ampm = hours < 11 || hours === 23 ? 'am' : 'pm'
    return `${hours % 12 + 1}${ampm}`
  },

  icons: {
    SUN: faSun,
    RAIN: faUmbrella,
    CLOUD: faCloud,
    SNOWFLAKE: faSnowflake,
  },
}
