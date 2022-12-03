import {
  faAsterisk,
  faCircle,
  faCircleQuestion,
  faCloud,
  faCloudBolt,
  faCloudMoon,
  faCloudRain,
  faCloudShowersHeavy,
  faCloudSun,
  faDroplet,
  faFire,
  faHurricane,
  faMoon,
  faSmog,
  faSnowflake,
  faSun,
  faTornado,
  faWind,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import dayjs from 'dayjs'
import React from 'react'

const iconMap = {
  'blizzard': { icon: faSnowflake, className: 'blizzard', layers: 4 },
  'clear:day': { icon: faSun, className: 'day-sunny', layers: 2 },
  'clear:night': { icon: faMoon, className: 'night-clear', layers: 2 },
  'cloudy': { icon: faCloud, className: 'cloud', layers: 2 },
  'fog': { icon: faSmog, className: 'fog', layers: 2 },
  'hot': { icon: [faCircle, faFire], className: 'hot' },
  'hurricane': { icon: faHurricane, className: 'hurricane', layers: 2 },
  'partly-cloudy:day': { icon: faCloudSun, className: 'partly-cloudy-day', layers: 3 },
  'partly-cloudy:night': { icon: faCloudMoon, className: 'partly-cloudy-night', layers: 2 },
  'rain': { icon: faCloudRain, className: 'rain', layers: 2 },
  'raindrop': { icon: faDroplet, className: 'raindrop' },
  'sleet': { icon: faCloudShowersHeavy, className: 'sleet', layers: 2 },
  'snow': { icon: [faCloud, faSnowflake, faSnowflake, faSnowflake], className: 'snow' },
  'snowflake': { icon: faSnowflake, className: 'snowflake' },
  'storm': { icon: faCloudBolt, className: 'storm', layers: 2 },
  'tornado': { icon: faTornado, className: 'tornado', layers: 2 },
  'wind': { icon: faWind, className: 'wind', layers: 2 },

  'default': { icon: faCircleQuestion, className: 'default' },
}

function getIconProps (iconName, adjustForDayNight) {
  // the remote specifies an icon for the worst weather of the day this
  // normalizes it so if it's current weather or today's forecast it shows
  // day during day and night during night. for the rest of the forecast,
  // it shows day. NOTE: not sure this is true anymore with WeatherKit api,
  // but can't hurt to do this anyway
  if (iconName === 'clear' || iconName === 'partly-cloudy') {
    if (adjustForDayNight) {
      const currentHour = dayjs().hour()
      const isDay = currentHour > 6 && currentHour < 20

      iconName += `:${isDay ? 'day' : 'night'}`
    } else {
      iconName += ':day'
    }
  }

  return iconMap[iconName] || iconMap.default
}

export const WeatherIcon = ({ adjustForTime = true, icon: iconName, ...props }) => {
  const { className, icon, layers } = getIconProps(iconName, adjustForTime)

  const icons = [].concat(icon)

  if (!layers && icons.length === 1) {
    return (
      <span className={`weather-icon ${className}`}>
        <FontAwesomeIcon icon={icon} fixedWidth {...props} />
      </span>
    )
  }

  const numLayers = layers || icons.length

  return (
    <span className={`weather-icon layered-icon ${className}`}>
      {Array(numLayers).fill(1).map((_, i) => (
        <FontAwesomeIcon key={i} icon={icons[i] || icons[0]} fixedWidth {...props} />
      ))}
    </span>
  )
}
