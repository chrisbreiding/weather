import cs from 'classnames'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import eventBus from '../lib/event-bus'
import locationStore from '../lib/location-store'
import weatherStore from '../lib/weather-store'
import util from '../lib/util'

import { DebugLogs } from './debug'
import Footer from './footer'
import Header from './header'
import Weather from './weather'
import { Queue } from '../lib/queue'
import { setLocationAndWeather } from '../lib/data'

export const App = ({ isStandalone }) => {
  const { lat, lng } = useParams()

  useEffect(() => {
    setLocationAndWeather(Queue.create(), util.decodeLatLng({ lat, lng }), false)
  }, [lat, lng])

  return (
    <div
      className={cs('app', { 'is-standalone': isStandalone })}
      onClick={() => eventBus.emit('global:click')}
    >
      <Header locationStore={locationStore} weatherStore={weatherStore} />
      <Weather locationStore={locationStore} weatherStore={weatherStore} />
      <Footer weatherStore={weatherStore} />
      <DebugLogs />
    </div>
  )
}
