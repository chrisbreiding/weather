import cs from 'classnames'
import React from 'react'
import { action } from 'mobx'
import { observer, useLocalObservable } from 'mobx-react-lite'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

import type { LocationStore } from '../lib/location-store'
import type { WeatherStore } from '../lib/weather-store'
import { Alerts } from './alerts'
import { Location } from './location'

interface HeaderProps {
  locationStore: LocationStore
  weatherStore: WeatherStore
}

export const Header = observer(({ locationStore, weatherStore }: HeaderProps) => {
  const state = useLocalObservable(() => ({
    showingAlerts: false,
    toggleShowingAlerts: action(() => {
      state.showingAlerts = !state.showingAlerts
    }),
  }))

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
              ? <Icon icon={faXmark} />
              : weatherStore.alerts.length
            }
          </button>
        </div>
      </div>
      <Alerts alerts={weatherStore.alerts} />
    </header>
  )
})
