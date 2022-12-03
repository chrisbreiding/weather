import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import cs from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'

import { chartState } from '../lib/chart-state'
import util from '../lib/util'

import { WeatherIcon } from './weather-icon'

const precipDetail = (day) => {
  return day.precipType === 'snow' ?
    `${util.toTenth(day.precipAccumulation)} in` :
    `${day.precipProbabilityPercent}%`
}

const Day = observer(({ day, hourlyWeather }) => {
  const { focusedDay } = hourlyWeather
  const isSnow = day.precipType === 'snow'

  return (
    <div
      className={cs('day', { 'is-focused': day.time === focusedDay })}
      style={{ width: `${chartState.dayWidth}px` }}
      onClick={() => chartState.setFocusedDay(day)}
    >
      <div className='date'>
        {util.getShortDisplayDateFromTimestamp(day.time)}
      </div>
      <div className='details'>
        <span className='temp-min'>{Math.round(day.temperatureLow)}°</span>
        {' '}|{' '}
        <span className='temp-max'>{Math.round(day.temperatureHigh)}°</span>
      </div>
      <div className='icon'>
        <WeatherIcon icon={day.icon} adjustForTime={util.isToday(day.time)} size='3x' />
      </div>
      <div className={cs('precip', { 'is-snow': isSnow })}>
        <WeatherIcon icon={isSnow ? 'snowflake' : 'raindrop'} />
        <span>{precipDetail(day)}</span>
      </div>
    </div>
  )
})

const DaysList = observer(({ dailyWeather, hourlyWeather }) => (
  <>
    {dailyWeather.days.map((day) => (
      <Day key={day.time} day={day} hourlyWeather={hourlyWeather} />
    ))}
  </>
))

const Days = observer(({ hourlyWeather, dailyWeather }) => (
  <div className='days' style={chartState.chartWidth ? { width: `${chartState.chartWidth}px` } : {}}>
    {!chartState.isAtStart && (
      <button className='days-arrow days-arrow-left' onClick={chartState.shiftDaysLeft}>
        <Icon icon={faAngleLeft} size='2x' />
      </button>
    )}
    <div className='days-scroll-container'>
      <div className='days-list' style={{ width: `${chartState.dayContainerWidth}px`, transform: `translateX(-${chartState.shiftAmount}px)` }}>
        <DaysList hourlyWeather={hourlyWeather} dailyWeather={dailyWeather} />
      </div>
      <div className='left-border' />
    </div>
    {!chartState.isAtEnd && (
      <button className='days-arrow days-arrow-right' onClick={chartState.shiftDaysRight}>
        <Icon icon={faAngleRight} size='2x' />
      </button>
    )}
  </div>
))

export default Days
