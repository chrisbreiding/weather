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

export const Radar = ({ location, onOpen, onClose, updatedTimestamp = 0, controls = false, zoom = 6 }: RadarProps) => {
  const src = `https://maps.darksky.net/@radar,${location},${zoom}?fieldControl=${controls}&domain=${encodeURI(window.location.href)}&auth=1538703242_bbabefdbd4a3f1aa368ac46db3499950&embed=true&timeControl=false&defaultField=radar&__t=${updatedTimestamp}`

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
