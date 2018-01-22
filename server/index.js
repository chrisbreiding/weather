const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const rp = require('request-promise')

const app = express()

app.use(cors({
  origin: [
    /^http:\/\/localhost:\d{4}$/,
    /^https?:\/\/\w+\.crbapps\.com$/,
  ],
}))
app.use(bodyParser.json())
app.use((req, res, next) => {
  res.set('Content-Type', 'application/json')
  next()
})

let cachedData

const LOCATION_SEARCH_BASE_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json'

app.get('/location-search', (req, res) => {
  rp(`${LOCATION_SEARCH_BASE_URL}?key=${process.env.GOOGLE_API_KEY}&input=${req.query.query}`)
  .then((result) => {
    res.send(result)
  })
  .catch((err) => {
    res.status(500).json({ error: err })
  })
})

const LOCATION_DETAILS_PLACE_ID_BASE_URL = 'https://maps.googleapis.com/maps/api/place/details/json'
const LOCATION_DETAILS_LAT_LNG_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json'

app.get('/location-details', (req, res) => {
  const url = req.query.placeid ?
    `${LOCATION_DETAILS_PLACE_ID_BASE_URL}?key=${process.env.GOOGLE_API_KEY}&placeid=${req.query.placeid}` :
    `${LOCATION_DETAILS_LAT_LNG_BASE_URL}?key=${process.env.GOOGLE_API_KEY}&latlng=${req.query.latlng}`
  rp(url)
  .then((result) => {
    res.send(result)
  })
  .catch((err) => {
    res.status(500).json({ error: err })
  })
})

const WEATHER_BASE_URL = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API_KEY}`

app.get('/weather', (req, res) => {
  // if (cachedData) {
  //   res.send(cachedData)
  //   return
  // }

  rp(`${WEATHER_BASE_URL}/${req.query.location}?exclude=minutely,flags&extend=hourly`)
  .then((weatherJson) => {
    cachedData = weatherJson
    res.send(weatherJson)
  })
  .catch((err) => {
    res.status(500).json({ error: err })
  })
})

const port = 3333

app.listen(port, () => {
  console.log(`listening on port ${port}...`) // eslint-disable-line no-console
})
