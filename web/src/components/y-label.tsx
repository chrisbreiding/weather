import React from 'react'

interface YLabelProps {
  payload?: {
    value: any
  }
  render: (value: any) => string | React.ReactElement
  x?: number
  y?: number
}

export const YLabel = (props: YLabelProps) => {
  return (
    <text className='y-label' width='60' height='192' x={props.x} y={props.y} stroke='none' fill='#999' textAnchor='end'>
      <tspan x={props.x} dy='0.355em'>{props.render(props.payload?.value)}</tspan>
    </text>
  )
}
