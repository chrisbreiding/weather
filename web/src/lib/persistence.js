const storageKey = 'weather'

export const fetch = (key) => {
  const data = JSON.parse(localStorage[storageKey] || '{}')

  return key ? data[key] : data
}

export const save = (key, newData) => {
  const data = fetch()

  data[key] = newData
  localStorage[storageKey] = JSON.stringify(data)
}

export const migrate = (key) => {
  const data = localStorage[key]

  if (data) {
    const parsedData = JSON.parse(data)
    save(key, parsedData)
    delete localStorage[key]
  }
}
