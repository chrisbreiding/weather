import cs from 'classnames'
import React, { Component } from 'react'
import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import Icon from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faTimes } from '@fortawesome/fontawesome-pro-light'

import util from '../lib/util'

const getAlertId = (alert) => `${alert.title}${alert.time}${alert.expires}`

@observer
class Alert extends Component {
  @observable isOpen = false

  render () {
    const alert = this.props.alert

    return (
      <li className={cs('alert', { 'is-open': this.isOpen })}>
        <div>
          <span>
            <Icon icon={faExclamationTriangle} />
            {alert.title}
          </span>
          <button onClick={this._toggleOpen}>Show {this.isOpen ? 'less' : 'more'}</button>
          <button onClick={this.props.onDismiss}>
            <Icon icon={faTimes} />
          </button>
        </div>
        <p>{util.formatDateTime(alert.time)} - {util.formatDateTime(alert.expires)}</p>
        <p>{alert.description}</p>
      </li>
    )
  }

  @action _toggleOpen = () => {
    this.isOpen = !this.isOpen
  }
}

@observer
class Alerts extends Component {
  @observable dismissedAlerts = observable.map()

  render () {
    let alerts = this.props.alerts

    if (!alerts.length) return null

    alerts = alerts.filter((alert) => (
      !this.dismissedAlerts.get(getAlertId(alert))
    ))

    return (
      <div className='alerts'>
        <ul>
          {alerts.map((alert) => (
            <Alert
              key={getAlertId(alert)}
              alert={alert}
              onDismiss={() => this._dismissAlert(alert)}
            />
          ))}
        </ul>
      </div>
    )
  }

  _dismissAlert (alert) {
    this.dismissedAlerts.set(getAlertId(alert), true)
  }
}

export default Alerts
