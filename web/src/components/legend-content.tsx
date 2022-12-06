import React from 'react'

interface LegendContentProps {
  render: () => React.ReactElement
}

export const LegendContent = ({ render }: LegendContentProps) => (
  <div className='legend'>
    {render()}
  </div>
)
