import { Router } from 'director'

import data from './data'

const router = new Router({
  '/' () {
    data.setUserLocation()
  },
  '/forecast/:lat/:lng' (lat, lng) {
    [lat, lng] = [Number(lat), Number(lng)]
    if (isNaN(lat) || isNaN(lng)) {
      return router.setRoute('/')
    }
    data.setLocation({ lat, lng }, false)
  },
}).configure({
  html5history: true,
  notfound () {
    data.setUserLocation()
  },
})

export default router
