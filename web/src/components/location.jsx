import cs from 'classnames'
import React, { createRef, useEffect } from 'react'
import { action } from 'mobx'
import { observer, useObservable } from 'mobx-react-lite'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faLocationArrow, faSearch, faTimes } from '@fortawesome/pro-light-svg-icons'

import { Queue } from '../lib/queue'
import { setLocation, setUserLocation, searchLocations } from '../lib/data'
import eventBus from '../lib/event-bus'

import RecentLocation from './recent-location'

const Location = observer(({ locationStore }) => {
  const searchRef = createRef()

  const state = useObservable({
    options: [],
    query: null,
    showingRecent: false,

    setOptions: action((options) => {
      state.options = options
    }),
    setQuery: action((query) => {
      state.query = query
    }),
    setShowingRecent: action((showingRecent) => {
      state.showingRecent = showingRecent
    }),
  })

  const { current, recent, isLoading, error } = locationStore
  const location = current || { description: '' }

  const onOutsideClick = () => {
    state.setOptions([])
    state.setQuery(null)
    state.setShowingRecent(false)
  }

  useEffect(() => {
    eventBus.on('global:click', onOutsideClick)

    return () => {
      eventBus.off('global:click', onOutsideClick)
    }
  }, [true])

  const onClick = (e) => {
    e.stopPropagation()
    state.setShowingRecent(true)
  }

  const updateSearch = (e) => {
    state.setQuery(e.target.value)
  }

  const getUserLocation = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (locationStore.isSearchingLocations) return

    state.setOptions([])

    setUserLocation(Queue.create())
  }

  const onFocusQuery = () => {
    state.setShowingRecent(true)
  }

  const searchLocation = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const query = (state.query || '').trim()
    if (!query || locationStore.isSearchingLocations) return

    const queue = Queue.create()

    searchLocations(queue, query).then((options) => {
      if (queue.canceled) return

      state.setOptions(options)
    })
  }

  const onEsc = (e) => {
    if (e.key === 'Escape') {
      locationStore.setSearchingLocations(false)
      state.setQuery(null)
      state.setOptions([])
      state.setShowingRecent(false)
      searchRef.current.blur()
    }
  }

  const onLocationChosen = (location) => () => {
    state.setOptions([])
    state.setQuery(null)
    setLocation(Queue.create(), location.placeId, false)
  }

  const removeRecentLocation = (location) => (e) => {
    e.stopPropagation()
    locationStore.removeRecent(location)
  }

  const updateRecentDescription = (location) => (description) => {
    locationStore.updateDescription(location, description)
  }

  const clearSearch = (e) => {
    e.stopPropagation()
    state.setQuery('')
    searchRef.current.focus()
    state.setShowingRecent(true)
  }

  return (
    <div className='location'>
      <div
        className={cs('location-chooser', {
          'showing-recent': !!recent.length && state.showingRecent,
          'has-options': !!state.options.length,
          'has-error': !!error,
        })}
      >
        <button
          className='user-location'
          onClick={getUserLocation}
          disabled={isLoading}
        >
          <Icon icon={faLocationArrow} className={cs({
            animate: locationStore.isLoadingUserLocation,
          })} />
        </button>

        <div className='chooser'>
          <form onSubmit={searchLocation}>
            <input
              className='query'
              ref={searchRef}
              value={state.query != null ? state.query : location.description}
              onChange={updateSearch}
              onClick={onClick}
              onFocus={onFocusQuery}
              onKeyUp={onEsc}
            />
            <div className='clear' onClick={clearSearch}>
              <Icon icon={faTimes} />
            </div>
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
        </div>
        <button className='search' onClick={searchLocation} disabled={isLoading}>
          <Icon icon={faSearch} className={cs({
            animate: locationStore.isLoadingLocationDetails || locationStore.isSearchingLocations,
          })} />
        </button>
      </div>
    </div>
  )
})

export default Location
