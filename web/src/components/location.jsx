import cs from 'classnames'
import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { action, observable } from 'mobx'
import Icon from '@fortawesome/react-fontawesome'
import {
  faClock,
  faLocationArrow,
  faSearch,
  faSpinner,
  faTrashAlt,
} from '@fortawesome/fontawesome-pro-light'

import data from '../lib/data'
import eventBus from '../lib/event-bus'
import util from '../lib/util'

@observer
class Location extends Component {
  @observable options = []
  @observable query
  @observable isSearching = false
  @observable showingRecent = false

  render () {
    const { current, recent, isLoading: locationLoading, error } = this.props.locationStore
    const location = current || { description: '' }
    const isLoading = this.isSearching || locationLoading

    return (
      <div className='location'>
        <form
          className={cs('location-chooser', {
            'is-loading': isLoading,
            'showing-recent': this.showingRecent,
            'has-options': !!this.options.length,
            'has-recent': current && !!recent.length,
            'has-error': !!error,
          })}
          onSubmit={this._searchLocation}
        >
          <a className='user-location' href='#' onClick={this._getUserLocation} disabled={isLoading}>
            <Icon icon={faLocationArrow} />
          </a>

          <div className='recent'>
            <a href='#' onClick={this._toggleRecent} disabled={isLoading}>
              <Icon icon={faClock} />
            </a>
            <ul>
              {recent.map((location) => (
                <li key={location.placeId}>
                  <div onClick={this._onLocationChosen(location)}>{location.description}</div>
                  <a href='#' onClick={this._removeRecentLocation(location)}><Icon icon={faTrashAlt} /></a>
                </li>
              ))}
            </ul>
          </div>

          <div className='chooser'>
            <input
              value={this.query || location.description}
              onChange={this._updateSearch}
              onFocus={this._select}
            />

            <ul className='options'>
              {this.options.map((option) => (
                <li key={option.placeId} onClick={this._onLocationChosen(option)}>{option.description}</li>
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
          <button type='submit' disabled={isLoading}>
            <Icon icon={faSearch} />
          </button>
        </form>
      </div>
    )
  }

  componentDidMount () {
    eventBus.on('global:click', this._onOutsideClick)
  }

  @action _onOutsideClick = () => {
    this.options = []
    this.showingRecent = false
  }

  @action _updateSearch = (e) => {
    this.query = e.target.value
  }

  _select = (e) => {
    e.target.select()
  }

  @action _getUserLocation = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (this.isSearching) return

    this.options = []

    this.isSearching = true
    util.getUserLocation().then(action((latLng) => {
      this.isSearching = false
      this._setLocation(latLng, true)
    }))
  }

  @action _toggleRecent = (e) => {
    e.preventDefault()
    e.stopPropagation()

    this.showingRecent = !this.showingRecent
  }

  @action _searchLocation = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const query = (this.query || '').trim()
    if (!query || this.isSearching) return

    this.isSearching = true
    data.searchLocations(query)
  }

  @action _setOptions = (options) => {
    this.isSearching = false
    this.options = options
  }

  _onLocationChosen = (location) => action(() => {
    this.options = []
    this.search = null
    this._setLocation(location.placeId, false)
  })

  _removeRecentLocation = (location) => action((e) => {
    e.preventDefault()
    this.props.locationStore.removeRecent(location)
  })

  _setLocation = (placeIdOrLatLng, isGeolocated) => {
    data.setLocation(placeIdOrLatLng, isGeolocated)
  }
}

export default Location
