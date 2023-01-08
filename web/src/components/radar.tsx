import cs from 'classnames'
import React from 'react'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

import type { Location } from '../lib/location-store'

interface RadarProps {
  controls?: boolean
  location: Location
  onClose?: () => void
  onOpen?: () => void
  updatedTimestamp?: number
  zoom?: number
}

export const Radar = ({ location, onOpen, onClose, updatedTimestamp = 0, controls = false, zoom = 7 }: RadarProps) => {
  const src = `https://openweathermap.org/weathermap?basemap=map&cities=false&layer=radar&lat=${location.lat}&lon=${location.lng}&zoom=${zoom}&__t=${updatedTimestamp}`

  return (
    <div className={cs('radar', { 'with-controls': controls })}>
      <div className='radar-container'>
        <iframe src={src} />
      </div>
      {onOpen && <div className='radar-cover' onClick={onOpen} />}
      { onClose && (
        <button className='radar-close' onClick={onClose}>
          <Icon className='icon' icon={faXmark} />
        </button>
      )}
    </div>
  )
}
