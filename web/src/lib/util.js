import moment from 'moment'

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

export default {
  coordsMatch ({ lat: lat1, lng: lng1 }, { lat: lat2, lng: lng2 }) {
    return (
      roundCoord(lat1) - roundCoord(lat2) < 10 &&
      roundCoord(lng1) - roundCoord(lng2) < 10
    )
  },

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

  getUserLocation () {
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
