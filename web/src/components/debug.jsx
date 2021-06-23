import React from 'react'
import { observer } from 'mobx-react-lite'
import { types } from 'mobx-state-tree'

const Log = types.model('Log', {
  timestamp: types.string,
  message: types.string,
})

export const debugStore = types.model('DebugStore', {
  active: false,
  logs: types.array(Log),
})
.actions((self) => ({
  toggle () {
    self.active = !self.active

    if (!self.active) {
      self.logs = []
    }
  },

  log (message) {
    if (self.active) {
      self.logs.push({
        message,
        timestamp: (new Date()).toISOString(),
      })
    }
  },

  clear () {
    if (self.active) {
      self.logs = []
    }
  },
}))
.create()

const timestampDisplay = (timestamp) => {
  return timestamp
  .replace('T', ' ')
  .replace(/\.\d+Z$/, '')
}

export const DebugLogs = observer(() => {
  if (!debugStore.active) return null

  return (
    <ul className='debug-logs'>
      {debugStore.logs.map((log) => (
        <li key={`${log.timestamp}-${log.message}`}>
          [{timestampDisplay(log.timestamp)}] {log.message}
        </li>
      ))}
    </ul>
  )
})
