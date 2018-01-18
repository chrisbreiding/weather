import React from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
  ReferenceArea,
} from 'recharts'

import util from '../lib/util'

const Days = ({ hourlyWeather }) => {
  const { days, firstDayTimestamp, lastDayTimestamp } = hourlyWeather

  const chartData = days.map((timestamp) => {
    return {
      date: util.getShortDisplayDateFromTimestamp(timestamp),
      value: 20,
      noon: util.getNoonFromTimestamp(timestamp),
    }
  })


  return (
    <div className='days'>
      <BarChart
        width={700}
        height={40}
        data={chartData}
      >
        <CartesianGrid stroke='#eee' />
        <XAxis
          dataKey='noon'
          type='number'
          hide={true}
          domain={[firstDayTimestamp, lastDayTimestamp]}
          tickSize={0}
          tickFormatter={() => ''}
          ticks={days}
        />
        <YAxis tick={false} />
        <ReferenceArea x1={150} x2={180} y1={200} y2={300} stroke="red" strokeOpacity={0.3} />
        <Bar dataKey="value" fill="rgba(255, 255, 255, 0)">
          <LabelList dataKey="date" position="inside" />
        </Bar>
      </BarChart>
    </div>
  )
}

export default Days
