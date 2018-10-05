import cs from 'classnames'
import React, { Component } from 'react'
import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faTimes, faCaretRight, faCaretDown } from '@fortawesome/fontawesome-pro-light'

import util from '../lib/util'

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
        {alert.descriptionParagraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
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
  @observable showingGroupedAlerts = false

  render () {
    let alerts = this.props.alerts

    if (!alerts.length) return null

    alerts = alerts.filter((alert) => (
      !this.dismissedAlerts.get(util.getAlertId(alert))
    ))

    return (
      <div className='alerts'>
        {alerts.length > 2 ? this._alertsGroup(alerts) : this._alerts(alerts)}
      </div>
    )
  }

  _alertsGroup (alerts) {
    return (
      <div
        className={cs('alerts-grouped', {
          'showing-alerts': this.showingGroupedAlerts,
        })}
      >
        <div onClick={this._toggleShowingAlerts}>
          <Icon icon={this.showingGroupedAlerts ? faCaretDown : faCaretRight} />
          <Icon icon={faExclamationTriangle} />
          {alerts.length} alerts
        </div>
        {this._alerts(alerts)}
      </div>
    )
  }

  _alerts (alerts) {
    return (
      <ul>
        {alerts.map((alert) => (
          <Alert
            key={util.getAlertId(alert)}
            alert={alert}
            onDismiss={() => this._dismissAlert(alert)}
          />
        ))}
      </ul>
    )
  }

  @action _toggleShowingAlerts = () => {
    this.showingGroupedAlerts = !this.showingGroupedAlerts
  }

  @action _dismissAlert (alert) {
    this.dismissedAlerts.set(util.getAlertId(alert), true)
  }
}

export default Alerts
