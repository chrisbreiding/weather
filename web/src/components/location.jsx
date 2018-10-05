import cs from 'classnames'
import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { action, observable } from 'mobx'
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

@observer
class Location extends Component {
  @observable options = []
  @observable query = null
  @observable isSearching = false
  @observable showingRecent = false

  render () {
    const { current, recent, isLoading: locationLoading, error } = this.props.locationStore
    const location = current || { description: '' }
    const isLoading = this.isSearching || locationLoading

    return (
      <div className='location'>
        <div
          className={cs('location-chooser', {
            'is-loading': isLoading,
            'showing-recent': !!recent.length && this.showingRecent,
            'has-options': !!this.options.length,
            'has-error': !!error,
          })}
        >
          <button className='user-location' onClick={this._getUserLocation} disabled={isLoading}>
            <Icon icon={faLocationArrow} />
          </button>

          <div className='chooser'>
            <form onSubmit={this._searchLocation}>
              <input
                className='query'
                value={this.query != null ? this.query : location.description}
                onChange={this._updateSearch}
                onClick={this._stop}
                onFocus={this._onFocusQuery}
                onKeyUp={this._onEsc}
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
                  onSelect={this._onLocationChosen(location)}
                  onRemove={this._removeRecentLocation(location)}
                  onEdit={this._updateRecentDescription(location)}
                />
              ))}
            </ul>

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
          <button className='search' onClick={this._searchLocation} disabled={isLoading}>
            <Icon icon={faSearch} />
          </button>
        </div>
      </div>
    )
  }

  componentDidMount () {
    eventBus.on('global:click', this._onOutsideClick)
  }

  _stop (e) {
    e.stopPropagation()
  }

  @action _onOutsideClick = () => {
    this.options = []
    this.showingRecent = false
  }

  @action _updateSearch = (e) => {
    this.query = e.target.value
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

  @action _onFocusQuery = (e) => {
    e.target.select()
    this.showingRecent = true
  }

  @action _searchLocation = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const query = (this.query || '').trim()
    if (!query || this.isSearching) return

    this.isSearching = true
    data.searchLocations(query).then(this._setOptions)
  }

  @action _setOptions = (options) => {
    this.isSearching = false
    this.options = options
  }

  @action _onEsc = (e) => {
    if (e.key === 'Escape') {
      this.isSearching = false
      this.options = []
    }
  }

  _onLocationChosen = (location) => action(() => {
    this.options = []
    this.query = null
    this._setLocation(location.placeId, false)
  })

  _removeRecentLocation = (location) => (e) => {
    e.stopPropagation()
    this.props.locationStore.removeRecent(location)
  }

  _updateRecentDescription = (location) => (description) => {
    this.props.locationStore.updateDescription(location, description)
  }

  _setLocation = (placeIdOrLatLng, isGeolocated) => {
    data.setLocation(placeIdOrLatLng, isGeolocated)
  }
}

export default Location
