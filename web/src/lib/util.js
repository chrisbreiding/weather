import moment from 'moment'

const iconMap = {
  'clear-day:day': 'day-sunny',
  'clear-day:night': 'night-clear',
  'clear-night:day': 'day-sunny',
  'clear-night:night': 'night-clear',
  'rain': 'rain',
  'snow': 'snow',
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
    // make up for dark sky giving a night icon during the
    // day and vice versa
    if (/(day|night)/.test(icon)) {
      const hours = moment().toObject().hours
      const isDay = hours > 6 && hours < 20
      icon += `:${isDay ? 'day' : 'night'}`
    }

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
