import cs from 'classnames'
import React from 'react'
import { observer } from 'mobx-react-lite'
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

import util from '../lib/util'
import { WeatherIcon } from './weather-icon'

const Days = observer(({ hourlyWeather, dailyWeather, onSelectDay }) => {
  const { focusedDay, weekStartTimestamp, weekEndTimestamp } = hourlyWeather
  const { days } = dailyWeather

  const precipDetail = (day) => {
    return day.precipType === 'snow' ?
      `${util.toTenth(day.precipAccumulation)} in` :
      `${day.precipProbabilityPercent}%`
  }

  const customLabel = (props) => {
    const day = days[props.value]
    const isSnow = day.precipType === 'snow'

    return (
      <foreignObject
        className='day-label-container'
        x={props.x}
        y={props.y}
        width={props.width}
        height={props.height}
      >
        <div
          className={cs('day-label', { 'is-focused': day.time === focusedDay })}
          onClick={() => onSelectDay(day)}
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
            <WeatherIcon darkSkyIcon={day.icon} adjustForTime={util.isToday(day.time)} size='3x' />
          </div>
          <div className={cs('precip', { 'is-snow': isSnow })}>
            <WeatherIcon iconName={isSnow ? 'SNOWFLAKE' : 'RAINDROP'} />
            <span>{precipDetail(day)}</span>
          </div>
        </div>
      </foreignObject>
    )
  }

  const chartData = days.map((day, index) => {
    return {
      index,
      value: 20,
      time: util.getShortDisplayDateFromTimestamp(day.time),
      noon: util.getNoonFromTimestamp(day.time),
    }
  })

  return (
    <div className='days'>
      <ResponsiveContainer width='100%' minWidth={600} height={145}>
        <BarChart
          barCategoryGap={0}
          barGap={0}
          data={chartData}
        >
          <CartesianGrid stroke='#dfdfdf' />
          <XAxis
            dataKey='noon'
            type='number'
            hide={true}
            domain={[weekStartTimestamp, weekEndTimestamp]}
            tickSize={0}
            tickFormatter={() => ''}
            ticks={days}
          />
          <YAxis tick={false} />
          <Bar dataKey="value" fill="rgba(255, 255, 255, 0)" isAnimationActive={false}>
            <LabelList
              dataKey="index"
              position="inside"
              content={customLabel}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
})

export default Days
