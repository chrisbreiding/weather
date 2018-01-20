import moment from 'moment'

const iconMap = {
  'clear-day': 'day-sunny',
  'clear-night': 'night-clear',
  'rain': 'rain',
  'snow': 'snow',
  'sleet': 'sleet',
  'wind': 'strong-wind',
  'fog': 'fog',
  'cloudy': 'cloud',
  'partly-cloudy-day': 'day-cloudy',
  'partly-cloudy-night': 'night-alt-cloudy',
  'default': 'moon-new',
}

export default {
  currentTimestamp () {
    return moment().unix()
  },

  getNoonFromTimestamp (timestamp) {
    return moment.unix(timestamp).startOf('day').add(12, 'hours').unix()
  },

  getShortDisplayDateFromTimestamp (timestamp) {
    return moment.unix(timestamp).format('ddd M/D')
  },

  getDarkSkyIcon (icon) {
    return iconMap[icon] || iconMap.default
  },

  formatTime (timestamp) {
    return moment.unix(timestamp).format('ha')
  },

  icons: {
    SUN: 'day-sunny',
    RAIN: 'rain',
    CLOUD: 'cloud',
    SNOWFLAKE: 'snow',
  },
}
