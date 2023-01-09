import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import cs from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'

import { chartState } from '../lib/chart-state'
import type { DailyWeather, Day as DayModel, NullDailyWeather, NullDay } from '../lib/daily-weather-model'
import { getShortDisplayDateFromTimestamp, isToday, toTenth } from '../lib/util'

import { WeatherIcon } from './weather-icon'

const precipDetail = (day: DayModel | NullDay) => {
  return day.precipType === 'snow' ?
    `${day.precipAccumulation} in` :
    `${day.precipProbabilityPercent}%`
}

interface DayProps {
  day: DayModel | NullDay
}

const Day = observer(({ day }: DayProps) => {
  const { focusedDay } = chartState
  const isSnow = day.precipType === 'snow'

  return (
    <div
      className={cs('day', { 'is-focused': day.time === focusedDay })}
      style={{ width: `${chartState.dayWidth}px` }}
      onClick={() => chartState.setFocusedDay(day)}
    >
      <div className='date'>
        {getShortDisplayDateFromTimestamp(day.time)}
      </div>
      <div className='details'>
        <span className='temp-min'>{day.temperatureLow}°</span>
        {' '}|{' '}
        <span className='temp-max'>{day.temperatureHigh}°</span>
      </div>
      <div className='icon'>
        <WeatherIcon iconName={day.icon} adjustForTime={isToday(day.time)} size='3x' />
      </div>
      <div className={cs('precip', { 'is-snow': isSnow })}>
        <WeatherIcon iconName={isSnow ? 'snowflake' : 'raindrop'} />
        <span>{precipDetail(day)}</span>
      </div>
    </div>
  )
})

interface DailyProps {
  dailyWeather: DailyWeather | NullDailyWeather
}

const DaysList = observer(({ dailyWeather }: DailyProps) => (
  <>
    {dailyWeather.days.map((day) => (
      <Day key={day.time} day={day} />
    ))}
  </>
))

export const Days = observer(({ dailyWeather }: DailyProps) => (
  <div className='days' style={chartState.chartWidth ? { width: `${chartState.chartWidth}px` } : {}}>
    {!chartState.isAtStart && (
      <button className='days-arrow days-arrow-left' onClick={chartState.shiftDaysLeft}>
        <Icon icon={faAngleLeft} size='2x' />
      </button>
    )}
    <div className='days-scroll-container'>
      <div className='days-list' style={{ width: `${chartState.dayContainerWidth}px`, transform: `translateX(-${chartState.shiftAmount}px)` }}>
        <DaysList dailyWeather={dailyWeather} />
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
