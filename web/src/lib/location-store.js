import find from 'lodash.find'
import findIndex from 'lodash.findindex'
import { getSnapshot, types } from 'mobx-state-tree'

import util from './util'

const Location = types.model('Location', {
  description: '',
  placeId: types.identifier(types.string),
  lat: types.number,
  lng: types.number,
  isGeolocated: false,
})
.views((self) => ({
  toString () {
    return `${self.lat},${self.lng}`
  },
}))

const getCache = () => {
  return JSON.parse(localStorage.cachedLocations || '{}')
}

const getExistingFromCache = (cache, location) => {
  return cache[location.placeId] || find(Object.values(cache), (cachedLocation) => (
    util.coordsMatch(location, cachedLocation)
  ))
}

const LocationStore = types.model('LocationStore', {
  isLoading: true,
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

  getLocationFromCache (placeIdOrLatLng) {
    const location = placeIdOrLatLng.lat ? placeIdOrLatLng : { placeId: placeIdOrLatLng }
    return getExistingFromCache(getCache(), location)
  },
}))
.actions((self) => ({
  setCurrent (location) {
    location = Location.create(location)
    self.current = location
    self._addToRecent(location)
    self._addToCache(location)
    return location
  },

  setLoading (isLoading) {
    self.isLoading = isLoading
  },

  setError (error) {
    self.error = error && error.message ? error.message : error
  },

  updateDescription (location, description) {
    location.description = description
    self._updateCache(location)
    self._updateRecentLocalStorage()
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
    self._updateRecentLocalStorage()
  },

  _removeFromRecent (index) {
    if (index > -1) {
      self._recent.splice(index, 1)
      self._updateRecentLocalStorage()
    }
  },

  _addToCache (location) {
    const cache = getCache()
    const existing = getExistingFromCache(cache, location)
    if (existing) return

    cache[location.placeId] = getSnapshot(location)
    localStorage.cachedLocations = JSON.stringify(cache)
  },

  _updateCache (location) {
    const cache = getCache()
    const existing = getExistingFromCache(cache, location)
    if (!existing) return

    cache[location.placeId] = getSnapshot(location)
    localStorage.cachedLocations = JSON.stringify(cache)
  },

  _updateRecentLocalStorage () {
    localStorage.recentLocations = JSON.stringify(getSnapshot(self._recent))
  },
}))

const recent = JSON.parse(localStorage.recentLocations || '[]')

export default LocationStore.create({ _recent: recent })
