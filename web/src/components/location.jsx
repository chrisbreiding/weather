import { observer } from 'mobx-react'
import React, { Component } from 'react'

import api from '../lib/api'
import util from '../lib/util'

import Loader from './loader'
import LocationChooser from './location-chooser'

@observer
class Location extends Component {
  render () {
    if (this.props.locationStore.isLoadingDefault) {
      return <Loader />
    }

    return (
      <div className='location'>
        <LocationChooser
          current={this.props.locationStore.current}
          recent={this.props.locationStore.recent}
          isLoading={this.props.locationStore.isLoadingDetails}
          onSelect={this._getLocationDetails}
          onRemove={this._removeRecentLocation}
        />
      </div>
    )
  }

  componentDidMount () {
    util.getUserLocation().then((latLng) => {
      this.props.locationStore.setLoadingDefault(false)
      this._getLocationDetails(latLng, true)
    })
  }

  _getLocationDetails = (placeIdOrLatLng, byLatLng) => {
    this.props.locationStore.setLoadingDetails(true)

    api.getLocationDetails(placeIdOrLatLng, byLatLng)
    .then((location) => {
      this._setLocation(location, byLatLng)
    })
    .catch(this._handleError)
  }

  _setLocation = (location, isGeolocated = false) => {
    if (!location) return

    location.isGeolocated = isGeolocated

    this.props.locationStore.setLoadingDetails(false)
    this.props.locationStore.setCurrent(location)
    this.props.onChange()
  }

  _removeRecentLocation = (location) => {
    this.props.locationStore.removeRecent(location)
  }

  _handleError = (error) => {
    this.props.locationStore.setLoadingDetails(false)
    // eslint-disable-next-line no-console
    console.log('Error getting locations:', error)
  }
}

export default Location
