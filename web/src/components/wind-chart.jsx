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

import util from '../lib/util'

const WindChart = observer(({ hourlyWeather, minWidth }) => {
  const { days, startTimestamp, endTimestamp } = hourlyWeather

  return (
    <ResponsiveContainer className='wind-chart' width='100%' minWidth={minWidth} height={170}>
      <LineChart
        data={hourlyWeather.chartData}
        syncId='weather'
      >
        <CartesianGrid stroke='#eee' />
        <ReferenceLine x={util.currentTimestamp()} stroke='#ccc' />
        <XAxis
          dataKey='time'
          type='number'
          domain={[startTimestamp, endTimestamp]}
          axisLine={false}
          tickSize={0}
          tickFormatter={() => ''}
          ticks={days}
        />
        <YAxis tick={<YLabel render={(value) => `${value} mph`} />} axisLine={false} />
        <Tooltip content={<TooltipContent render={(data) => (
          <div className='wind'>{`${data.windSpeed} mph`}</div>
        )} />} />
        <Legend content={<LegendContent render={() => (
          <div className='legend-item wind-speed'>
            <span className='box' />
            <span>Wind Speed (mph)</span>
          </div>
        )} />} />
        <Line
          type='linear'
          name='Wind Speed'
          dataKey='windSpeed'
          stroke='#002384'
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
})

export default WindChart
