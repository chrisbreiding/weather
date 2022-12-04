import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import FastClick from 'fastclick'
import { configure as configureMobx } from 'mobx'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { App } from './components/app'
import { debugStore } from './components/debug'
import { IconPreview } from './components/icon-preview'
import { NoLocation } from './components/no-location'
import { Standalone } from './components/standalone'
import util from './lib/util'

dayjs.extend(isBetween)
new FastClick(document.body)
configureMobx({ enforceActions: 'always' })

const isStandalone = util.isStandalone()

debugStore.log('iStandalone?', isStandalone)

const Main = () => (
  <Router>
    <Routes>
      <Route path='/icons' element={<IconPreview />} />
      <Route path='/standalone' element={<Standalone />}>
        <Route path=':lat/:lng' element={<App isStandalone={isStandalone} />} />
      </Route>
      <Route path='/forecast/:lat/:lng' element={<App isStandalone={isStandalone} />} />
      <Route path='*' element={<NoLocation isStandalone={isStandalone} />} />
    </Routes>
  </Router>
)

createRoot(document.getElementById('app')).render(<Main />)
