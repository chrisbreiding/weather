const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const rp = require('request-promise')

const BASE_URL = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API_KEY}`

const app = express()

app.use(cors({
  origin: [
    /^http:\/\/localhost:\d{4}$/,
    /^https?:\/\/\w+\.crbapps\.com$/,
  ],
}))
app.use(bodyParser.json())

let cachedData

app.get('/weather', (req, res) => {
  res.set('Content-Type', 'application/json')

  if (cachedData) {
    res.send(cachedData)
    return
  }

  rp(`${BASE_URL}/${req.query.coords}?exclude=minutely,flags&extend=hourly`)
  .then(function (weatherJson) {
    cachedData = weatherJson
    res.send(weatherJson)
  })
  .catch(function (err) {
    res.status(500).json({ error: err })
  })
})

const port = 3333

app.listen(port, () => {
  console.log(`listening on port ${port}...`) // eslint-disable-line no-console
})
