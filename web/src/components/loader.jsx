import React from 'react'
import Icon from 'react-weathericons'

import util from '../lib/util'

const Loader = () => (
  <div className='loader'>
    <Icon name={util.icons.RAIN} className='icon rain' size="4x" />
    <Icon name={util.icons.SUN} className='icon sun' size="4x" />
    <Icon name={util.icons.SNOW} className='icon snow' size="4x" />
  </div>
)

export default Loader
