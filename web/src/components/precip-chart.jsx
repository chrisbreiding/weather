import { observer } from 'mobx-react'
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

import util from '../lib/util'


const PrecipChart = observer(({ hourlyWeather, minWidth }) => {
  const { days, startTimestamp, endTimestamp } = hourlyWeather

  return (
    <ResponsiveContainer className='precip-chart' width='100%' minWidth={minWidth} height={170}>
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
          type='step'
          name=''
          dataKey='precipSnowProbability'
          stroke='#0cafe2'
          fillOpacity={0}
          dot={false}
          activeDot={{ r: 5 }}
        />
        <Area
          type='step'
          name='Chance of Precip. (%)'
          dataKey='precipProbability'
          stroke='transparent'
          fillOpacity={0.2}
          fill='#0cafe2'
          dot={false}
          activeDot={false}
        />
        <Area
          type='step'
          name='Chance of Snow (%)'
          dataKey='snowProbability'
          stroke='transparent'
          fillOpacity={0.2}
          fill='#9645e8'
          dot={false}
          activeDot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
})

export default PrecipChart
