import React from 'react'
import { formatTime } from '../lib/util'

interface TooltipProps {
  payload?: any[]
  render: (value: any) => React.ReactElement
}

export const TooltipContent = ({ payload, render }: TooltipProps) => {
  if (!payload || !payload[0]) return null

  const data = payload[0].payload

  return (
    <div className='tooltip'>
      <div className='time'>{formatTime(data.time)}</div>
      {render(data)}
    </div>
  )
}
