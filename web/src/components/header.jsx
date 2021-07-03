import cs from 'classnames'
import React from 'react'
import { action } from 'mobx'
import { observer, useObservable } from 'mobx-react-lite'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/pro-light-svg-icons'

import Alerts from './alerts'
import Location from './location'

const Weather = observer(({ locationStore, weatherStore }) => {
  const state = useObservable({
    showingAlerts: false,
    toggleShowingAlerts: action(() => {
      state.showingAlerts = !state.showingAlerts
    }),
  })

  return (
    <header className={cs({
      'has-alerts': !!weatherStore.alerts.length,
      'showing-alerts': state.showingAlerts,
    })}>
      <div className='location-alerts'>
        <Location locationStore={locationStore} />
        <div className='alerts-badge'>
          <button onClick={state.toggleShowingAlerts}>
            {state.showingAlerts
              ? <Icon icon={faTimes} />
              : weatherStore.alerts.length
            }
          </button>
        </div>
      </div>
      <Alerts alerts={weatherStore.alerts} />
    </header>
  )
})

export default Weather
