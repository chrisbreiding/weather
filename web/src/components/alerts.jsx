import cs from 'classnames'
import React from 'react'
import { action } from 'mobx'
import { observer, useObservable } from 'mobx-react-lite'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/pro-light-svg-icons'

import util from '../lib/util'

const Alert = observer(({ alert }) => {
  const state = useObservable({
    isOpen: false,
    toggleOpen: action(() => {
      state.isOpen = !state.isOpen
    }),
  })

  return (
    <li className={cs('alert', { 'is-open': state.isOpen })}>
      <div className='alert-title'>
        <span>
          <Icon icon={faExclamationTriangle} />
          {alert.title}
        </span>
        <button onClick={state.toggleOpen}>{state.isOpen ? 'Hide' : 'Show'} details</button>
      </div>
      <p>{util.formatDateTime(alert.time)} - {util.formatDateTime(alert.expires)}</p>
      {alert.descriptionParagraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </li>
  )
})

const Alerts = observer(({ alerts }) => {
  return (
    <div className='alerts'>
      <ul>
        {alerts.map((alert) => (
          <Alert key={util.getAlertId(alert)} alert={alert} />
        ))}
      </ul>
    </div>
  )
})

export default Alerts
