import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import FastClick from 'fastclick'
import { configure as configureMobx } from 'mobx'
import React from 'react'
import { createRoot } from 'react-dom/client'

import { IconPreview } from './components/icon-preview'
import { App } from './components/app'

dayjs.extend(isBetween)
new FastClick(document.body)
configureMobx({ enforceActions: 'always' })

const Main = () => {
  if (location.pathname === '/icons') {
    return <IconPreview />
  }

  return <App />
}

createRoot(document.getElementById('app')).render(<Main />)
