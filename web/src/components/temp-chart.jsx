import { observer } from 'mobx-react-lite'
import React, { Fragment } from 'react'
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

const TempChart = observer(({ hourlyWeather, minWidth }) => {
  const { days, startTimestamp, endTimestamp } = hourlyWeather
  const sharedLineProps = {
    activeDot: { r: 5 },
    dot: false,
    isAnimationActive: false,
    strokeWidth: 2,
    type: 'linear',
  }

  return (
    <ResponsiveContainer className='temp-chart' width='100%' minWidth={minWidth} height={170}>
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
          axisLine={false}
          tickSize={0}
          tickFormatter={() => ''}
          ticks={days}
        />
        <YAxis tick={<YLabel render={(value) => `${value}°F`} />} axisLine={false} />
        <Tooltip wrapperStyle={{ outline: 'none' }} content={<TooltipContent render={(data) => (
          <div>
            <div className='temp'>{`${data.temp}°F`}</div>
            <div className='apparent-temp'>{`${data.apparentTemp}°F`}</div>
          </div>
        )} />} />
        <Legend content={<LegendContent render={() => (
          <Fragment>
            <div className='legend-item temp'>
              <span className='box' />
              <span>Temperature (°F)</span>
            </div>
            <div className='legend-item apparent-temp'>
              <span className='box' />
              <span>Feels Like (°F)</span>
            </div>
          </Fragment>
        )} />} />
        <Line
          dataKey='apparentTemp'
          name='Feels Like (°F)'
          stroke={colors.$cold}
          {...sharedLineProps}
        />
        <Line
          dataKey='temp'
          name='Temperature (°F)'
          stroke={colors.$temp}
          {...sharedLineProps}
        />
      </LineChart>
    </ResponsiveContainer>
  )
})

export default TempChart
