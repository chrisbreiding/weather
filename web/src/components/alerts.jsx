import cs from 'classnames'
import React from 'react'
import { action, observable } from 'mobx'
import { observer, useObservable } from 'mobx-react-lite'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faTimes, faCaretRight, faCaretDown } from '@fortawesome/fontawesome-pro-light'

import util from '../lib/util'

const Alert = observer(({ alert, onDismiss }) => {
  const state = useObservable({
    isOpen: false,
    toggleOpen: action(() => {
      state.isOpen = !state.isOpen
    }),
  })

  return (
    <li className={cs('alert', { 'is-open': state.isOpen })}>
      <div>
        <span>
          <Icon icon={faExclamationTriangle} />
          {alert.title}
        </span>
        <button onClick={state.toggleOpen}>Show {state.isOpen ? 'less' : 'more'}</button>
        <button onClick={onDismiss}>
          <Icon icon={faTimes} />
        </button>
      </div>
      <p>{util.formatDateTime(alert.time)} - {util.formatDateTime(alert.expires)}</p>
      {alert.descriptionParagraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </li>
  )
})

const AlertsList = observer(({ alerts, dismissAlert }) => {
  return (
    <ul>
      {alerts.map((alert) => (
        <Alert
          key={util.getAlertId(alert)}
          alert={alert}
          onDismiss={() => dismissAlert(alert)}
        />
      ))}
    </ul>
  )
})

const AlertsGroup = observer(({ alerts, dismissAlert }) => {
  const state = useObservable({
    dismissedAlerts: observable.map(),
    showingGroupedAlerts: false,

    toggleShowingAlerts: action(() => {
      state.showingGroupedAlerts = !state.showingGroupedAlerts
    }),
  })

  return (
    <div
      className={cs('alerts-grouped', {
        'showing-alerts': state.showingGroupedAlerts,
      })}
    >
      <div onClick={state.toggleShowingAlerts}>
        <Icon icon={state.showingGroupedAlerts ? faCaretDown : faCaretRight} />
        <Icon icon={faExclamationTriangle} />
        {alerts.length} alerts
      </div>
      <AlertsList alerts={alerts} dismissAlert={dismissAlert} />
    </div>
  )
})

const Alerts = observer(({ alerts }) => {
  const state = useObservable({
    dismissedAlerts: observable.map(),
    showingGroupedAlerts: false,

    dismissAlert: action((alert) => {
      state.dismissedAlerts.set(util.getAlertId(alert), true)
    }),
  })

  if (!alerts.length) return null

  const filteredAlerts = alerts.filter((alert) => (
    !state.dismissedAlerts.get(util.getAlertId(alert))
  ))

  return (
    <div className='alerts'>
      {filteredAlerts.length > 2 ?
        <AlertsGroup alerts={filteredAlerts} dismissAlert={state.dismissAlert} /> :
        <AlertsList alerts={filteredAlerts} dismissAlert={state.dismissAlert} />
      }
    </div>
  )
})

export default Alerts
