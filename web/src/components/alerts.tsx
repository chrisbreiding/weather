import cs from 'classnames'
import React from 'react'
import { action } from 'mobx'
import { observer, useLocalObservable } from 'mobx-react-lite'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

import { formatDateTime } from '../lib/util'
import type { Alert as AlertModel } from '../lib/alert-model'

interface AlertProps {
  alert: AlertModel
}

const Alert = observer(({ alert }: AlertProps) => {
  const state = useLocalObservable(() => ({
    isOpen: false,
    toggleOpen: action(() => {
      state.isOpen = !state.isOpen
    }),
  }))

  return (
    <li className={cs('alert', { 'is-open': state.isOpen })}>
      <div className='alert-title'>
        <span>
          <Icon icon={faExclamationTriangle} />
          {alert.title}
        </span>
        <button onClick={state.toggleOpen}>{state.isOpen ? 'Hide' : 'Show'} details</button>
      </div>
      <p>{formatDateTime(alert.time)} - {formatDateTime(alert.expires)}</p>
      {alert.descriptionParagraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </li>
  )
})

interface AlertsProps {
  alerts: AlertModel[]
}

export const Alerts = observer(({ alerts }: AlertsProps) => {
  return (
    <div className='alerts'>
      <ul>
        {alerts.map((alert) => (
          <Alert key={alert.id} alert={alert} />
        ))}
      </ul>
    </div>
  )
})
