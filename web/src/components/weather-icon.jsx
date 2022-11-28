import {
  faSun,
  faMoon,
  faCloudRain,
  faSnowflake,
  faCloudShowersHeavy,
  faWind,
  faSmog,
  faCloud,
  faCloudSun,
  faCloudMoon,
  faCircle,
  faDroplet,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import moment from 'moment'
import React from 'react'

const iconMap = {
  'clear-day:day': { icon: faSun, className: 'day-sunny' },
  'clear-day:night': { icon: faMoon, className: 'night-clear' },
  'clear-night:day': { icon: faSun, className: 'day-sunny' },
  'clear-night:night': { icon: faMoon, className: 'night-clear' },
  'rain': { icon: faCloudRain, className: 'rain' },
  'snow': { icon: faSnowflake, className: 'snow' },
  'sleet': { icon: faCloudShowersHeavy, className: 'sleet' },
  'wind': { icon: faWind, className: 'wind' },
  'fog': { icon: faSmog, className: 'fog' },
  'cloudy': { icon: faCloud, className: 'cloud' },
  'partly-cloudy-day:day': { icon: faCloudSun, className: 'cloud' },
  'partly-cloudy-day:night': { icon: faCloudMoon, className: 'cloud' },
  'partly-cloudy-night:day': { icon: faCloudSun, className: 'cloud' },
  'partly-cloudy-night:night': { icon: faCloudMoon, className: 'cloud' },
  'default': { icon: faCircle, className: 'default' },
}

const namedIcons = {
  SUN: { icon: faSun, className: 'day-sunny' },
  RAIN: { icon: faCloudRain, className: 'rain' },
  RAINDROP: { icon: faDroplet, className: 'rain' },
  SNOW: { icon: faSnowflake, className: 'snow' },
  SNOWFLAKE: { icon: faSnowflake, className: 'snow' },
}

function getDarkSkyIcon (icon, adjustForDayNight) {
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
}

export const WeatherIcon = ({ adjustForTime = true, darkSkyIcon, iconName, ...props }) => {
  const icon = darkSkyIcon ? getDarkSkyIcon(darkSkyIcon, adjustForTime) : namedIcons[iconName]

  return <FontAwesomeIcon icon={icon.icon} className={`weather-icon ${icon.className}`} {...props} />
}
