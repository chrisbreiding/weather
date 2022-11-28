import cs from 'classnames'
import React from 'react'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

const Radar = ({ location, onOpen, onClose, controls = false, zoom = 6 }) => {
  const src = `https://maps.darksky.net/@radar,${location},${zoom}?fieldControl=${controls}&domain=${encodeURI(window.location.href)}&auth=1538703242_bbabefdbd4a3f1aa368ac46db3499950&embed=true&timeControl=false&defaultField=radar`

  return (
    <div className={cs('radar', { 'with-controls': controls })}>
      <div className='radar-container'>
        <iframe src={src} />
      </div>
      <div className='radar-cover' onClick={onOpen} />
      <button className='radar-close' onClick={onClose}>
        <Icon className='icon' icon={faXmark} />
      </button>
    </div>
  )
}

export default Radar
