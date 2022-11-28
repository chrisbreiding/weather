import React from 'react'
import { observer } from 'mobx-react-lite'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faBug, faArrowRotateRight } from '@fortawesome/free-solid-svg-icons'

import { debugStore } from './debug'
import util from '../lib/util'

const toggleDebug = () => {
  debugStore.toggle()
}

const reload = () => {
  window.location.reload(true)
}

const Footer = observer(() => {
  if (!util.isStandalone()) return null

  return (
    <div className='footer'>
      <button className='debug' onClick={toggleDebug} href='#'>
        <Icon className='icon' icon={faBug} /> {debugStore.active ? 'Disable' : 'Enable'} Debugging
      </button>
      <button className='reload' onClick={reload} href='#'>
        <Icon className='icon' icon={faArrowRotateRight} /> Reload Page
      </button>
    </div>
  )
})

export default Footer
