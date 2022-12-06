import React from 'react'
import { observer } from 'mobx-react-lite'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faBug, faArrowRotateRight } from '@fortawesome/free-solid-svg-icons'

import { isStandalone } from '../lib/util'
import { debugStore } from './debug'
import type { WeatherStore } from '../lib/weather-store'

const reload = () => {
  // @ts-ignore
  window.location.reload(true)
}

interface FooterProps {
  weatherStore: WeatherStore
}

export const Footer = observer(({ weatherStore }: FooterProps) => {
  if (!isStandalone() || weatherStore.isLoading) return null

  return (
    <div className='footer'>
      <button className='debug' onClick={debugStore.toggle}>
        <Icon className='icon' icon={faBug} /> {debugStore.active ? 'Disable' : 'Enable'} Debugging
      </button>
      <button className='reload' onClick={reload}>
        <Icon className='icon' icon={faArrowRotateRight} /> Reload Page
      </button>
    </div>
  )
})
