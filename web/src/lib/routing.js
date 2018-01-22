// import { createHistory } from 'history'
import { Router } from 'director'

const startRouter = () => {
  new Router({
    '/forecast/:placeId': (placeId) => {
      console.log(placeId)
      // 1. check for placeId in local storage, use it if there
      // 2. if not there, get loc details
    },
  }).configure({
    notfound: () => {
      // eslint-disable-next-line no-consoles
      console.warn('Route not found')
    },
    html5history: true,
  }).init()
}

export default startRouter
