import { observer } from 'mobx-react'
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

import TooltipContent from './tooltip-content'
import YLabel from './y-label'
import util from '../lib/util'

const TempChart = observer(({ hourlyWeather }) => {
  const { days, focusedDay, startTimestamp, endTimestamp } = hourlyWeather

  const minWidth = focusedDay ? 350 : 600

  return (
    <ResponsiveContainer className='temp-chart' width='100%' minWidth={minWidth} height={120}>
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
        <YAxis tick={<YLabel render={(value) => `${value}°F`} />} axisLine={false} />
        <Tooltip content={<TooltipContent render={(data) => (
          <div>
            <div className='temp'>{`${data.temp}°F`}</div>
            <div className='apparent-temp'>{`${data.apparentTemp}°F`}</div>
          </div>
        )} />} />
        <Legend align='right' iconType='rect' iconSize={12} />
        <Line
          type='linear'
          name='Feels Like (°F)'
          dataKey='apparentTemp'
          stroke='#9645e8'
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
        />
        <Line
          type='linear'
          name='Temperature (°F)'
          dataKey='temp'
          stroke='#F00'
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
})

export default TempChart
