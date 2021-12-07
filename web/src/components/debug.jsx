import React from 'react'
import { observer } from 'mobx-react-lite'
import { getSnapshot, types } from 'mobx-state-tree'

import { fetch, save } from '../lib/persistence'
import util from '../lib/util'

const Log = types.model('Log', {
  timestamp: types.string,
  messages: types.array(types.string),
})
.views((self) => ({
  get message () {
    return self.messages.map((message) => {
      // get rid of surrounding quotes JSON.stringify adds
      return message.replace(/^"/, '').replace(/"$/, '')
    }).join(' ')
  },
}))

export const debugStore = types.model('DebugStore', {
  active: false,
  logs: types.array(Log),
})
.views((self) => ({
  get hasLogs () {
    return !!self.logs.length
  },

  get allText () {
    return self.logs.map(({ message, timestamp }) => {
      return `[${timestampDisplay(timestamp)}] ${message}`
    }).join('\n\n')
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

const copyToClipboard = () => {
  util.copyToClipboard(debugStore.allText)
}

export const DebugLogs = observer(() => {
  if (!debugStore.active) return null

  return (
    <div className='debug-logs'>
      {debugStore.hasLogs && <>
        <button onClick={copyToClipboard}>Copy</button>
        <button onClick={debugStore.clear}>Clear</button>
      </>}
      <ul>
        {debugStore.logs.map((log) => (
          <li key={`${log.timestamp}-${log.message}`}>
            <span className='timestamp'>[{timestampDisplay(log.timestamp)}]</span>
            <span className='message'>{log.message}</span>
          </li>
        ))}
      </ul>
    </div>
  )
})
