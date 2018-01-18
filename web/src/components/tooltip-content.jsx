import React from 'react'
import util from '../lib/util'

const Tooltip = ({ payload, render }) => {
  if (!payload[0]) return null

  const data = payload[0].payload

  return (
    <div className='tooltip'>
      <div className='time'>{util.formatTime(data.time)}</div>
      {render(data)}
    </div>
  )
}

export default Tooltip
