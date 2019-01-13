import cs from 'classnames'
import React, { useEffect } from 'react'
import { action } from 'mobx'
import { observer, useObservable } from 'mobx-react-lite'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faLocationArrow,
  faSearch,
  faSpinner,
} from '@fortawesome/fontawesome-pro-light'

import data from '../lib/data'
import eventBus from '../lib/event-bus'
import util from '../lib/util'

import RecentLocation from './recent-location'

const Location = observer(({ locationStore }) => {
  const state = useObservable({
    options: [],
    query: null,
    isSearching: false,
    showingRecent: false,

    setOptions: action((options) => {
      state.options = options
    }),
    setQuery: action((query) => {
      state.query = query
    }),
    setSearching: action((isSearching) => {
      state.isSearching = isSearching
    }),
    setShowingRecent: action((showingRecent) => {
      state.showingRecent = showingRecent
    }),
  })

  const { current, recent, isLoading: locationLoading, error } = locationStore
  const location = current || { description: '' }
  const isLoading = state.isSearching || locationLoading

  const onOutsideClick = () => {
    state.setOptions([])
    state.setShowingRecent(false)
  }

  useEffect(() => {
    eventBus.on('global:click', onOutsideClick)

    return () => {
      eventBus.off('global:click', onOutsideClick)
    }
  }, [true])

  const stop = (e) => {
    e.stopPropagation()
  }

  const updateSearch = (e) => {
    state.setQuery(e.target.value)
  }

  const setLocation = (placeIdOrLatLng, isGeolocated) => {
    data.setLocation(placeIdOrLatLng, isGeolocated)
  }

  const getUserLocation = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (state.isSearching) return

    state.setOptions([])
    state.setSearching(true)

    util.getUserLocation().then(action((latLng) => {
      state.setSearching(false)
      setLocation(latLng, true)
    }))
  }

  const onFocusQuery = (e) => {
    e.target.select()
    state.setShowingRecent(true)
  }

  const setOptions = (options) => {
    state.setSearching(false)
    state.setOptions(options)
  }

  const searchLocation = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const query = (state.query || '').trim()
    if (!query || state.isSearching) return

    state.setSearching(true)
    data.searchLocations(query).then(setOptions)
  }

  const onEsc = (e) => {
    if (e.key === 'Escape') {
      state.setSearching(false)
      state.setOptions([])
    }
  }

  const onLocationChosen = (location) => () => {
    state.setOptions([])
    state.setQuery(null)
    setLocation(location.placeId, false)
  }

  const removeRecentLocation = (location) => (e) => {
    e.stopPropagation()
    locationStore.removeRecent(location)
  }

  const updateRecentDescription = (location) => (description) => {
    locationStore.updateDescription(location, description)
  }

  return (
    <div className='location'>
      <div
        className={cs('location-chooser', {
          'is-loading': isLoading,
          'showing-recent': !!recent.length && state.showingRecent,
          'has-options': !!state.options.length,
          'has-error': !!error,
        })}
      >
        <button className='user-location' onClick={getUserLocation} disabled={isLoading}>
          <Icon icon={faLocationArrow} />
        </button>

        <div className='chooser'>
          <form onSubmit={searchLocation}>
            <input
              className='query'
              value={state.query != null ? state.query : location.description}
              onChange={updateSearch}
              onClick={stop}
              onFocus={onFocusQuery}
              onKeyUp={onEsc}
            />
          </form>

          <ul className='recent'>
            <li>
              <label>Recent Locations</label>
            </li>
            {recent.map((location) => (
              <RecentLocation
                key={location.placeId}
                location={location}
                onSelect={onLocationChosen(location)}
                onRemove={removeRecentLocation(location)}
                onEdit={updateRecentDescription(location)}
              />
            ))}
          </ul>

          <ul className='options'>
            {state.options.map((option) => (
              <li key={option.placeId} onClick={onLocationChosen(option)}>{option.description}</li>
            ))}
          </ul>

          <div className='location-error'>
            An error occurred:
            {error}
          </div>

          <div className='loading'>
            <Icon icon={faSpinner} spin />
          </div>
        </div>
        <button className='search' onClick={searchLocation} disabled={isLoading}>
          <Icon icon={faSearch} />
        </button>
      </div>
    </div>
  )
})

export default Location
