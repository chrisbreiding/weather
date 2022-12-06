import type { DebugLogProps, LocationCache, LocationProps, SourceWeather } from './types'

const storageKey = 'weather'

interface Persistence {
  cachedLocations: LocationCache
  debugActive: boolean
  debugLogs: DebugLogProps[]
  lastLoadedLocation: LocationProps
  lastLoadedWeather: SourceWeather
  recentLocations: LocationProps[]
}

function fetchAll (): Partial<Persistence> {
  return JSON.parse(localStorage[storageKey] || '{}')
}

export function fetch<T extends keyof Persistence> (key: T): Persistence[T] | undefined {
  const data = fetchAll()

  return data[key]
}

export function save<T extends keyof Persistence> (key: T, newData: Persistence[T]) {
  const data = fetchAll()

  data[key] = newData
  localStorage[storageKey] = JSON.stringify(data)
}

export function migrate<T extends keyof Persistence> (key: T) {
  const data = localStorage[key]

  if (data) {
    const parsedData = JSON.parse(data) as Persistence[T]

    save<T>(key, parsedData)
    delete localStorage[key]
  }
}
