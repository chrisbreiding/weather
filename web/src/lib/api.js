const BASE_URL = 'http://localhost:3333/weather'

export default {
  getWeather () {
    const coords = localStorage.coords

    return fetch(`${BASE_URL}?coords=${coords}`)
    .then((response) => response.json())
    .catch((err) => {
      console.error('Getting weather failed:', err.stack) // eslint-disable-line no-console
      throw err
    })
  },
}
