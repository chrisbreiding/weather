import React from 'react'

const YLabel = (props) => {
  return (
    <text className='y-label' width='60' height='192' x={props.x} y={props.y} stroke='none' fill='#999' textAnchor='end'>
      <tspan x={props.x} dy='0.355em'>{props.render(props.payload.value)}</tspan>
    </text>
  )
}

export default YLabel
