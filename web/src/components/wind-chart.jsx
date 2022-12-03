import { observer } from 'mobx-react-lite'
import React from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import LegendContent from './legend-content'
import TooltipContent from './tooltip-content'
import YLabel from './y-label'

import colors from '../lib/colors'
import util from '../lib/util'
import { chartAnimationProps, chartHeight, chartLineProps, chartMinWidth } from '../lib/constants'

const WindChart = observer(({ hourlyWeather }) => {
  const { days, startTimestamp, endTimestamp } = hourlyWeather

  return (
    <ResponsiveContainer className='wind-chart' width='100%' minWidth={chartMinWidth} height={chartHeight}>
      <LineChart
        data={hourlyWeather.chartData}
        syncId='weather'
      >
        <CartesianGrid stroke={colors.$border} />
        <ReferenceLine x={util.currentTimestamp()} stroke={colors.$nowLine} />
        <XAxis
          dataKey='time'
          type='number'
          domain={[startTimestamp, endTimestamp]}
          allowDataOverflow={true}
          axisLine={false}
          tickSize={0}
          tickFormatter={() => ''}
          ticks={days}
        />
        <YAxis tick={<YLabel render={(value) => `${value} mph`} />} axisLine={false} />
        <Tooltip wrapperStyle={{ outline: 'none' }} content={<TooltipContent render={(data) => (
          <div className='wind'>{`${util.toHundredth(data.windSpeed)} mph`}</div>
        )} />} />
        <Legend content={<LegendContent render={() => (
          <div className='legend-item wind-speed'>
            <span className='box' />
            <span>Wind Speed (mph)</span>
          </div>
        )} />} />
        <Line
          name='Wind Speed'
          dataKey='windSpeed'
          stroke={colors.$wind}
          {...chartAnimationProps}
          {...chartLineProps}
        />
      </LineChart>
    </ResponsiveContainer>
  )
})

export default WindChart
