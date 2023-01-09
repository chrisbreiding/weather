import { fetch, migrate, save } from './persistence'
import { coordsMatch, isStandalone } from './util'
import { action, computed, makeObservable, observable } from 'mobx'
import type { LocationCache, LocationProps, PlaceIdOrLatLng } from './types'

export class Location {
  description = '---'
  isGeolocated = false
  lat: number
  lng: number
  placeId: string

  constructor (props: LocationProps) {
    this.description = props.description
    this.isGeolocated = props.isGeolocated
    this.lat = props.lat
    this.lng = props.lng
    this.placeId = props.placeId

    makeObservable(this, {
      description: observable,
      isGeolocated: observable,
      lat: observable,
      lng: observable,
      placeId: observable,
    })
  }

  serialize () {
    return {
      description: this.description,
      isGeolocated: this.isGeolocated,
      lat: this.lat,
      lng: this.lng,
      placeId: this.placeId,
    }
  }

  toString () {
    return `${this.lat},${this.lng}`
  }
}

function getCache () {
  return fetch('cachedLocations') || {} as LocationCache
}

function getExistingFromCache (cache: LocationCache, placeIdOrLatLng: PlaceIdOrLatLng) {
  if ('placeId' in placeIdOrLatLng) {
    return cache[placeIdOrLatLng.placeId]
  }

  return Object.values(cache).find((cachedLocation) => {
    return coordsMatch(placeIdOrLatLng, cachedLocation)
  })
}

interface LocationStoreProps {
  recent: LocationProps[]
}

export class LocationStore {
  isLoadingLocationDetails = false
  isLoadingUserLocation = false
  isSearchingLocations = false
  ignoreNextLocation = false
  error?: string
  _recent: Location[]
  current?: Location

  constructor ({ recent }: LocationStoreProps) {
    this._recent = recent.map((location) => new Location(location))

    makeObservable(this, {
      current: observable,
      error: observable,
      ignoreNextLocation: observable,
      isLoadingLocationDetails: observable,
      isLoadingUserLocation: observable,
      isSearchingLocations: observable,
      _recent: observable,

      hasCurrent: computed,
      isLoading: computed,
      recent: computed,

      removeRecent: action,
      setCurrent: action,
      setError: action,
      setLoadingLocationDetails: action,
      setLoadingUserLocation: action,
      setSearchingLocations: action,
      updateDescription: action,

      _addToCache: action,
      _addToRecent: action,
      _removeFromRecent: action,
      _saveRecentLocations: action,
      _updateCache: action,
    })
  }

  get isLoading () {
    return (
      this.isLoadingLocationDetails
      || this.isLoadingUserLocation
      || this.isSearchingLocations
    )
  }

  get hasCurrent () {
    return !!this.current
  }

  get recent () {
    return this._recent.filter((location) => location !== this.current)
  }

  getLocationFromCache (placeIdOrLatLng: PlaceIdOrLatLng) {
    return getExistingFromCache(getCache(), placeIdOrLatLng)
  }

  setCurrent (locationProps: LocationProps) {
    const location = new Location(locationProps)

    this.current = location
    this._addToRecent(location)
    this._addToCache(location)

    return location
  }

  setLoadingLocationDetails (isLoadingLocationDetails: boolean) {
    this.isLoadingLocationDetails = isLoadingLocationDetails
  }

  setLoadingUserLocation (isLoadingUserLocation: boolean) {
    this.isLoadingUserLocation = isLoadingUserLocation
  }

  setSearchingLocations (isSearchingLocations: boolean) {
    this.isSearchingLocations = isSearchingLocations
  }

  setError (error?: string | { message: string }) {
    this.error = typeof error === 'object' && 'message' in error ? error.message : error
  }

  updateDescription (location: Location, description: string) {
    location.description = description
    this._updateCache(location)
    this._saveRecentLocations()
  }

  removeRecent (location: Location) {
    this._removeFromRecent(this._recent.findIndex(({ placeId }) => placeId === location.placeId))
  }

  _addToRecent (location: Location) {
    const existingIndex = this._recent.findIndex((recentLocation) => {
      if (location.isGeolocated && recentLocation.isGeolocated) {
        return coordsMatch(location, recentLocation)
      } else {
        return location.placeId === recentLocation.placeId
      }
    })

    this._removeFromRecent(existingIndex)

    this._recent.unshift(location)
    this._saveRecentLocations()
  }

  _removeFromRecent (index: number) {
    if (index > -1) {
      this._recent.splice(index, 1)
      this._saveRecentLocations()
    }
  }

  _addToCache (location: Location) {
    const cache = getCache()
    const existing = getExistingFromCache(cache, location)

    if (existing) return

    cache[location.placeId] = location.serialize()
    save('cachedLocations', cache)
  }

  _updateCache (location: Location) {
    const cache = getCache()
    const existing = getExistingFromCache(cache, location)

    if (!existing) return

    cache[location.placeId] = location.serialize()
    save('cachedLocations', cache)
  }

  _saveRecentLocations () {
    save('recentLocations', this._recent.map((location) => location.serialize()))
  }
}

migrate<'cachedLocations'>('cachedLocations')
migrate<'recentLocations'>('recentLocations')

const recent = fetch('recentLocations') || []
const lastLoadedLocation = fetch('lastLoadedLocation')

export const locationStore = new LocationStore({ recent })

if (isStandalone() && lastLoadedLocation) {
  locationStore.setCurrent(lastLoadedLocation)
}
