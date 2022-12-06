import { debugStore } from '../components/debug'
import type { LatLng, LocationProps, PlaceIdObject, PlaceIdOrLatLng, SourceWeather } from './types'

const BASE_URL = localStorage.apiUrl
  ? localStorage.apiUrl
  : /local/.test(location.hostname)
    ? `http://${location.hostname}:3333`
    : 'https://proxy.crbapps.com'

async function request<T> (url: string) {
  debugStore.log('request', url)

  const response = await fetch(url)
  const json = await response.json()

  return json as T
}

interface LocationSearchResult {
  predictions: {
    description: string
    place_id: string
  }[]
}

export interface LocationResult {
  description: string
  placeId: string
}

export async function searchLocations (query: string): Promise<LocationResult[]> {
  try {
    const response = await request<LocationSearchResult>(`${BASE_URL}/location-search?query=${query}`)

    return response.predictions.map((prediction) => ({
      description: prediction.description,
      placeId: prediction.place_id,
    }))
  } catch (error: any) {
    console.error('Getting location failed:', error.stack) // eslint-disable-line no-console
    throw error
  }
}

interface LocationDetails {
  place_id: string
  formatted_address: string
  geometry: {
    location: LatLng
  }
}

interface LocationDetailsPlaceIdResult {
  result: LocationDetails
}

interface LocationDetailsLatLngResult {
  results: LocationDetails[]
}

async function getLocationDetailsByPlaceId (url: string, { placeId }: PlaceIdObject) {
  const result = await request<LocationDetailsPlaceIdResult>(`${url}?placeid=${placeId}`)

  return result.result
}

async function getLocationDetailsByLatLng (url: string, { lat, lng }: LatLng) {
  const result = await request<LocationDetailsLatLngResult>(`${url}?latlng=${lat},${lng}`)

  return result.results[0]
}

export async function getLocationDetails (placeIdOrLatLng: PlaceIdOrLatLng) {
  const url = `${BASE_URL}/location-details`
  const byPlaceId = 'placeId' in placeIdOrLatLng

  try {
    const result = byPlaceId
      ? await getLocationDetailsByPlaceId(url, placeIdOrLatLng)
      : await getLocationDetailsByLatLng(url, placeIdOrLatLng)
    const location = result.geometry.location

    return {
      placeId: result.place_id,
      description: result.formatted_address.replace(', USA', ''),
      isGeolocated: false,
      lat: location.lat,
      lng: location.lng,
    } as LocationProps
  } catch (error: any) {
    console.error('Getting location failed:', error.stack) // eslint-disable-line no-console
    throw error
  }
}

export async function getWeather (location: string) {
  try {
    // Date.now() ensures the response isn't cached
    return request<SourceWeather>(`${BASE_URL}/weather?location=${location}&z=${Date.now()}`)
  } catch (error: any) {
    console.error('Getting weather failed:', error.stack) // eslint-disable-line no-console
    throw error
  }
}
