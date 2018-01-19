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
    return Math.floor(new Date().valueOf() / 1000)
  },

  getNoonFromTimestamp (timestamp) {
    return timestamp + 12 * 60 * 60
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
    SUN: 'day-sunny',
    RAIN: 'rain',
    CLOUD: 'cloud',
    SNOWFLAKE: 'snow',
  },
}
