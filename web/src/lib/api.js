const BASE_URL = 'http://localhost:3333/weather'

export default {
  getWeather () {
    const coords = localStorage.coords

    return fetch(`${BASE_URL}?coords=${coords}`)
    .then((response) => response.json())
    .then((response) => {
      if (!response.error) return response

      if (response.error.message) {
        throw Object.assign(new Error(response.error.message), response.error)
      } else if (typeof response.error === 'string') {
        throw new Error(response.error)
      } else {
        throw new Error(`Unexpected error: ${response.error}`)
      }
    })
    .catch((err) => {
      console.error('Getting weather failed:', err.stack) // eslint-disable-line no-console
      throw err
    })
  },
}
