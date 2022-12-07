import React from 'react'
import { action, computed, makeObservable, observable, toJS } from 'mobx'
import { observer } from 'mobx-react-lite'

import { fetch, save } from '../lib/persistence'
import * as util from '../lib/util'
import type { DebugLogProps } from '../lib/types'

class DebugLog {
  datetime: string
  messages: string[]

  constructor ({ datetime, messages }: DebugLogProps) {
    this.datetime = datetime
    this.messages = messages

    makeObservable(this, {
      datetime: observable,
      messages: observable,

      message: computed,
    })
  }

  get message () {
    return this.messages.join(' ')
  }

  serialize () {
    return {
      datetime: this.datetime,
      messages: toJS(this.messages),
    }
  }
}

interface DebugStoreProps {
  active: boolean
  logs: DebugLogProps[]
}

class DebugStore {
  active: boolean
  logs: DebugLog[]

  constructor ({ active, logs }: DebugStoreProps) {
    this.active = active
    this.logs = logs.map((logProps) => new DebugLog(logProps))

    makeObservable(this, {
      active: observable,
      logs: observable,

      hasLogs: computed,
      allText: computed,

      clear: action,
      log: action,
      toggle: action,
    })
  }

  get hasLogs () {
    return !!this.logs.length
  }

  get allText () {
    return this.logs.map(({ message, datetime }) => {
      return `[${datetimeDisplay(datetime)}] ${message}`
    }).join('\n\n')
  }

  toggle = () => {
    this.active = !this.active
    save('debugActive', this.active)
  }

  log (...messages: any[]) {
    if (this.active) {
      console.log(...messages) // eslint-disable-line no-console

      this.logs.push(new DebugLog({
        messages,
        datetime: (new Date()).toISOString(),
      }))

      this._save()
    }
  }

  clear = () => {
    if (this.active) {
      this.logs = []
      this._save()
    }
  }

  _save () {
    save('debugLogs', this.logs.map((log) => log.serialize()))
  }
}

export const debugStore = new DebugStore({
  active: fetch('debugActive') || false,
  logs: fetch('debugLogs') || [] as DebugLogProps[],
})

function datetimeDisplay (datetime: string) {
  return datetime
  .replace(/^\d{4}-\d{2}-\d{2}T/, '')
  .replace(/\.\d+Z$/, '')
}

function copyToClipboard () {
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
          <li key={`${log.datetime}-${log.message}`}>
            <span className='timestamp'>[{datetimeDisplay(log.datetime)}]</span>
            <span className='message'>{log.message}</span>
          </li>
        ))}
      </ul>
    </div>
  )
})
