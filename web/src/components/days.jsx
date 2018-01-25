import cs from 'classnames'
import React from 'react'
import { observer } from 'mobx-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from 'recharts'
import Icon from 'react-weathericons'

import util from '../lib/util'

const Days = observer(({ hourlyWeather, dailyWeather, onSelectDay }) => {
  const { focusedDay, weekStartTimestamp, weekEndTimestamp } = hourlyWeather
  const { days } = dailyWeather

  const customLabel = (props) => {
    const day = days[props.value]

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
            <span className='temp-min'>{Math.round(day.temperatureMin)}°</span>
            {' '}|{' '}
            <span className='temp-max'>{Math.round(day.temperatureMax)}°</span>
          </div>
          <div className='icon'>
            <Icon name={util.getDarkSkyIcon(day.icon, util.isToday(day.time))} size='3x' />
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
      <BarChart
        width={700}
        height={120}
        barCategoryGap={0}
        barGap={0}
        data={chartData}
      >
        <CartesianGrid stroke='#eee' />
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
    </div>
  )
})

export default Days
