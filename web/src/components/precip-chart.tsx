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

import colors from '../lib/colors.json'
import { chartAnimationProps, chartHeight, chartMinWidth } from '../lib/constants'
import type { HourlyWeather } from '../lib/hourly-weather-model'
import { currentTimestamp } from '../lib/util'
import { LegendContent } from './legend-content'
import { TooltipContent } from './tooltip-content'
import { YLabel } from './y-label'

interface PrecipChartProps {
  hourlyWeather: HourlyWeather
}

export const PrecipChart = observer(({ hourlyWeather }: PrecipChartProps) => {
  const { days, startTimestamp, endTimestamp } = hourlyWeather
  const sharedAreaProps = {
    activeDot: false,
    dot: false,
    fill: colors.$precipBorder,
    name: 'Chance of Precip. (%)',
    stroke: 'transparent',
    type: 'step' as const,
    ...chartAnimationProps,
  }

  return (
    <ResponsiveContainer className='precip-chart' width='100%' minWidth={chartMinWidth} height={chartHeight}>
      <AreaChart
        data={hourlyWeather.chartData}
        syncId='weather'
      >
        <CartesianGrid stroke={colors.$border} />
        <ReferenceLine x={currentTimestamp()} stroke={colors.$nowLine} />
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
