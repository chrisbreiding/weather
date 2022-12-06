import { faLocationArrow, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import cs from 'classnames'
import { action } from 'mobx'
import { observer, useLocalObservable } from 'mobx-react-lite'
import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { LocationResult } from '../lib/api'

import { setLocationAndWeather, getAndSetUserLocation, searchLocations } from '../lib/data'
import eventBus from '../lib/event-bus'
import type { Location as LocationModel, LocationStore } from '../lib/location-store'
import { Queue } from '../lib/queue'
import { RecentLocation } from './recent-location'

interface LocationProps {
  locationStore: LocationStore
}

export const Location = observer(({ locationStore }: LocationProps) => {
  const searchRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const state = useLocalObservable(() => ({
    options: [] as LocationResult[],
    query: null as string | null,
    showingRecent: false,

    setOptions: action((options: LocationResult[]) => {
      state.options = options
    }),
    setQuery: action((query: string | null) => {
      state.query = query
    }),
    setShowingRecent: action((showingRecent: boolean) => {
      state.showingRecent = showingRecent
    }),
  }))

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

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    state.setShowingRecent(true)
  }

  const updateSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    state.setQuery(e.target.value)
  }

  const getUserLocation = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (locationStore.isSearchingLocations) return

    state.setOptions([])

    const path = await getAndSetUserLocation(Queue.create())

    if (path) {
      navigate(path)
    }
  }

  const onFocusQuery = () => {
    state.setShowingRecent(true)
  }

  const searchLocation = (e: React.FormEvent | React.MouseEvent) => {
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

  const onEsc = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      locationStore.setSearchingLocations(false)
      state.setQuery(null)
      state.setOptions([])
      state.setShowingRecent(false)
      searchRef.current?.blur()
    }
  }

  const onLocationChosen = <T extends { placeId: string }>(location: T) => async () => {
    state.setOptions([])
    state.setQuery(null)

    const path = await setLocationAndWeather(Queue.create(), { placeId: location.placeId }, false)

    if (path) {
      navigate(path)
    }
  }

  const removeRecentLocation = (location: LocationModel) => () => {
    locationStore.removeRecent(location)
  }

  const updateRecentDescription = (location: LocationModel) => (description: string) => {
    locationStore.updateDescription(location, description)
  }

  const clearSearch = (e: React.MouseEvent) => {
    e.stopPropagation()
    state.setQuery('')
    searchRef.current?.focus()
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
          type='button'
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
              <Icon icon={faXmark} />
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
          <Icon icon={faMagnifyingGlass} className={cs({
            animate: locationStore.isLoadingLocationDetails || locationStore.isSearchingLocations,
          })} />
        </button>
      </div>
    </div>
  )
})
