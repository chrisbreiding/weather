import { Router } from 'director'

import { setDefaultLocation, setLocation } from './data'
import { Queue } from './queue'

const router = new Router({
  '/' () {
    setDefaultLocation(Queue.create())
  },
  '/forecast/:lat/:lng' (lat, lng) {
    [lat, lng] = [Number(lat), Number(lng)]
    if (isNaN(lat) || isNaN(lng)) {
      return router.setRoute('/')
    }
    setLocation(Queue.create(), { lat, lng }, false)
  },
}).configure({
  html5history: true,
  notfound () {
    setDefaultLocation(Queue.create())
  },
})

const oldSetRoute = router.setRoute.bind(router)
router.setRoute = (...args) => {
  if (window.onpopstate) {
    oldSetRoute(...args)
  } else {
    setTimeout(() => {
      router.setRoute(...args)
    }, 10)
  }
}

export default router
