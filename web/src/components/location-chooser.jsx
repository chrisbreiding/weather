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

import api from '../lib/api'
import eventBus from '../lib/event-bus'
import util from '../lib/util'

@observer
class LocationChooser extends Component {
  @observable options = []
  @observable search
  @observable isSearching = false
  @observable showingRecent = false

  render () {
    const location = this.props.current || { description: '' }
    const isLoading = this.isSearching || this.props.isLoading

    return (
      <form
        className={cs('location-chooser', {
          'is-loading': isLoading,
          'showing-recent': this.showingRecent,
          'has-options': !!this.options.length,
          'has-recent': this.props.current && !!this.props.recent.length,
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
            {this.props.recent.map((location) => (
              <li key={location.placeId}>
                <div onClick={this._setLocation(location)}>{location.description}</div>
                <a href='#' onClick={this._removeRecentLocation(location)}><Icon icon={faTrashAlt} /></a>
              </li>
            ))}
          </ul>
        </div>

        <div className='chooser'>
          <input
            value={this.search || location.description}
            onChange={this._updateSearch}
            onFocus={this._select}
          />

          <ul className='options'>
            {this.options.map((option) => (
              <li key={option.placeId} onClick={this._setLocation(option)}>{option.description}</li>
            ))}
          </ul>

          <div className='loading'>
            <Icon icon={faSpinner} spin />
          </div>
        </div>
        <button type='submit' disabled={isLoading}>
          <Icon icon={faSearch} />
        </button>
      </form>
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
    this.search = e.target.value
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
      this.props.onSelect(latLng, true)
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

    const search = (this.search || '').trim()
    if (!search || this.isSearching) return

    this.isSearching = true

    api.searchLocations(search)
    .then(this._setOptions)
    .catch(this._handleError)
  }

  @action _setOptions = (result) => {
    this.isSearching = false
    this.options = result.predictions.map((prediction) => ({
      description: prediction.description,
      placeId: prediction.place_id,
    }))
  }

  _setLocation = (location) => action(() => {
    this.options = []
    this.search = null
    this.props.onSelect(location.placeId)
  })

  _removeRecentLocation = (location) => action(() => {
    this.props.onRemove(location)
  })
}

export default LocationChooser
