import React from 'react'
import { observer } from 'mobx-react-lite'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faBug, faRedo } from '@fortawesome/pro-light-svg-icons'

import { debugStore } from './debug'
import util from '../lib/util'

const toggleDebug = (e) => {
  e.preventDefault()
  debugStore.toggle()
}

const reload = (e) => {
  e.preventDefault()
  window.location.reload(true)
}

const Footer = observer(() => (
  <p className='footer'>
    {util.isStandalone() &&
      <a className='debug' onClick={toggleDebug} href='#'>
        <Icon className='icon' icon={faBug} /> {debugStore.active ? 'Disable' : 'Enable'} Debugging
      </a>
    }
    <div role='spacer' />
    <a className='reload' onClick={reload} href='#'>
      <Icon className='icon' icon={faRedo} /> Reload Page
    </a>
  </p>
))

export default Footer
