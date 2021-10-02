import React from 'react'
import { observer } from 'mobx-react-lite'
import { getSnapshot, types } from 'mobx-state-tree'

import { fetch, save } from '../lib/persistence'

const Log = types.model('Log', {
  timestamp: types.string,
  message: types.string,
})

export const debugStore = types.model('DebugStore', {
  active: false,
  logs: types.array(Log),
})
.views((self) => ({
  get hasLogs () {
    return !!self.logs.length
  },
}))
.actions((self) => ({
  toggle () {
    self.active = !self.active
    save('debugActive', self.active)
  },

  log (message) {
    if (self.active) {
      self.logs.push({
        message,
        timestamp: (new Date()).toISOString(),
      })
      self._save()
    }
  },

  clear () {
    if (self.active) {
      self.logs = []
      self._save()
    }
  },

  _save () {
    save('debugLogs', getSnapshot(self.logs))
  },
}))
.create({
  active: fetch('debugActive') || false,
  logs: fetch('debugLogs') || [],
})

const timestampDisplay = (timestamp) => {
  return timestamp
  .replace(/^\d{4}-\d{2}-\d{2}T/, '')
  .replace(/\.\d+Z$/, '')
}

export const DebugLogs = observer(() => {
  if (!debugStore.active) return null

  return (
    <div className='debug-logs'>
      {debugStore.hasLogs &&
        <button onClick={debugStore.clear}>Clear</button>
      }
      <ul>
        {debugStore.logs.map((log) => (
          <li key={`${log.timestamp}-${log.message}`}>
            [{timestampDisplay(log.timestamp)}] {log.message}
          </li>
        ))}
      </ul>
    </div>
  )
})
