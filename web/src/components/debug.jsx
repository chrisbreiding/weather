import React from 'react'
import { observer } from 'mobx-react-lite'
import { getSnapshot, types } from 'mobx-state-tree'

import { fetch, save } from '../lib/persistence'

const Log = types.model('Log', {
  timestamp: types.string,
  messages: types.array(types.string),
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

  log (...messages) {
    if (self.active) {
      self.logs.push({
        messages,
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
        {debugStore.logs.map((log) => {
          const message = log.messages.map((message) => {
            // get rid of surrounding quotes JSON.stringify adds
            return JSON.stringify(message).replace(/^"/, '').replace(/"$/, '')
          }).join(' ')

          return (
            <li key={`${log.timestamp}-${message}`}>
              <span className='timestamp'>[{timestampDisplay(log.timestamp)}]</span>
              <span className='message'>{message}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
})
