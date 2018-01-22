import findIndex from 'lodash.findindex'
import { getSnapshot, types } from 'mobx-state-tree'

import util from './util'

const Location = types.model('Location', {
  _description: '',
  placeId: types.identifier(types.string),
  lat: types.number,
  lng: types.number,
  isGeolocated: false,
})
.views((self) => ({
  get description () {
    return self._description || self.toString()
  },

  toString () {
    return `${self.lat},${self.lng}`
  },
}))

const LocationStore = types.model('LocationStore', {
  isLoadingDefault: true,
  isLoadingDetails: false,
  error: types.maybe(types.string),
  _recent: types.array(Location),
  current: types.maybe(types.reference(Location)),
})
.views((self) => ({
  get hasCurrent () {
    return !!self.current
  },

  get recent () {
    return self._recent.filter((location) => location !== self.current)
  },
}))
.actions((self) => ({
  setCurrent (location) {
    location = Location.create(location)
    self.current = location
    self._addToRecent(location)
  },

  setLoadingDefault (isLoading) {
    self.isLoadingDefault = isLoading
  },

  setLoadingDetails (isLoading) {
    self.isLoadingDetails = isLoading
  },

  setError (error) {
    self.error = error && error.message ? error.message : error
  },

  removeRecent (location) {
    self._removeFromRecent(findIndex(self._recent, { placeId: location.placeId }))
  },

  _addToRecent (location) {
    const existingIndex = findIndex(self._recent, (recentLocation) => {
      if (location.isGeolocated && recentLocation.isGeolocated) {
        return util.coordsMatch(location, recentLocation)
      } else {
        return location.placeId === recentLocation.placeId
      }
    })
    self._removeFromRecent(existingIndex)

    self._recent.unshift(location)
    localStorage.recentLocations = JSON.stringify(getSnapshot(self._recent))
  },

  _removeFromRecent (index) {
    if (index > -1) {
      self._recent.splice(index, 1)
    }
  },
}))

const recent = JSON.parse(localStorage.recentLocations || '[]')

export default LocationStore.create({ _recent: recent })
