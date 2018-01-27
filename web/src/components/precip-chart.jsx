import { observer } from 'mobx-react'
import React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import YLabel from './y-label'
import TooltipContent from './tooltip-content'
import util from '../lib/util'

const PrecipChart = observer(({ hourlyWeather }) => {
  const { days, focusedDay, startTimestamp, endTimestamp } = hourlyWeather

  const minWidth = focusedDay ? 350 : 600

  return (
    <ResponsiveContainer className='precip-chart' width='100%' minWidth={minWidth} height={120}>
      <AreaChart
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
        <YAxis domain={[0, 100]} tick={<YLabel render={(value) => `${value}%`} />} axisLine={false} />
        <Tooltip content={<TooltipContent render={(data) => (
          <div className='precip'>{`${data.precipProbability}%`}</div>
        )} />} />
        <Legend align='right' iconType='rect' iconSize={12} />
        <Area
          type='step'
          name='Chance of Precip. (%)'
          dataKey='precipProbability'
          stroke='#0cafe2'
          fillOpacity={0.2}
          fill='#0cafe2'
          dot={false}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
})

export default PrecipChart
