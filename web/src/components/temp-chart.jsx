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
import { chartAnimationProps, chartHeight, chartLineProps, chartMinWidth } from '../lib/constants'
import util from '../lib/util'

const TempChart = observer(({ hourlyWeather }) => {
  const { days, startTimestamp, endTimestamp } = hourlyWeather
  const sharedLineProps = {
    ...chartAnimationProps,
    ...chartLineProps,
  }

  return (
    <ResponsiveContainer className='temp-chart' width='100%' minWidth={chartMinWidth} height={chartHeight}>
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
