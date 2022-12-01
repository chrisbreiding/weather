import { observer } from 'mobx-react-lite'
import React, { Fragment } from 'react'
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

import LegendContent from './legend-content'
import TooltipContent from './tooltip-content'
import YLabel from './y-label'

import colors from '../lib/colors'
import util from '../lib/util'


const PrecipChart = observer(({ hourlyWeather, minWidth }) => {
  const { days, startTimestamp, endTimestamp } = hourlyWeather
  const sharedAreaProps = {
    activeDot: false,
    dot: false,
    fill: colors.$precipBorder,
    isAnimationActive: false,
    name: 'Chance of Precip. (%)',
    stroke: 'transparent',
    type: 'step',
  }

  return (
    <ResponsiveContainer className='precip-chart' width='100%' minWidth={minWidth} height={170}>
      <AreaChart
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
        <YAxis domain={[0, 100]} tick={<YLabel render={(value) => `${value}%`} />} axisLine={false} />
        <Tooltip wrapperStyle={{ outline: 'none' }} content={<TooltipContent render={(data) => (
          <div className='precip'>{`${data.precipProbability || data.snowProbability}%`}</div>
        )} />} />
        <Legend content={<LegendContent render={() => (
          <Fragment>
            <div className='legend-item precip-probability'>
              <span className='box' />
              <span>Chance of Precip. (%)</span>
            </div>
            <div className='legend-item snow-probability'>
              <span className='box' />
              <span>Chance of Snow (%)</span>
            </div>
          </Fragment>
        )} />} />
        <Area
          dataKey='precipSnowProbability'
          fillOpacity={0}
          {...sharedAreaProps}
          activeDot={{ r: 5 }}
          fill={undefined}
          name=''
          stroke={colors.$precipBorder}
        />
        <Area
          dataKey='lowPrecipProbability'
          fillOpacity={0.2}
          {...sharedAreaProps}
        />
        <Area
          dataKey='mediumPrecipProbability'
          fillOpacity={0.4}
          {...sharedAreaProps}
        />
        <Area
          dataKey='highPrecipProbability'
          fillOpacity={0.6}
          {...sharedAreaProps}
        />
        <Area
          dataKey='veryHighPrecipProbability'
          fillOpacity={0.8}
          {...sharedAreaProps}
        />
        <Area
          dataKey='snowProbability'
          fillOpacity={0.4}
          {...sharedAreaProps}
          fill={colors.$cold}
          name='Chance of Snow (%)'
        />
      </AreaChart>
    </ResponsiveContainer>
  )
})

export default PrecipChart
