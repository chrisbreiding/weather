import { observer } from 'mobx-react'
import React from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import TooltipContent from './tooltip-content'
import YLabel from './y-label'
import util from '../lib/util'

const TempChart = observer(({ hourlyWeather }) => {
  const { days, firstDayTimestamp, lastDayTimestamp } = hourlyWeather

  return (
    <div className='temp-chart'>
      <LineChart
        width={700}
        height={180}
        data={hourlyWeather.chartData}
        syncId='weather'
      >
        <CartesianGrid stroke='#eee' />
        <ReferenceLine x={util.currentTimestamp()} stroke='#ccc' />
        <XAxis
          dataKey='time'
          type='number'
          domain={[firstDayTimestamp, lastDayTimestamp]}
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
          isAnimationActive={false}
        />
        <Line
          type='linear'
          name='Temperature (°F)'
          dataKey='temp'
          stroke='#F00'
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </LineChart>
    </div>
  )
})

export default TempChart
