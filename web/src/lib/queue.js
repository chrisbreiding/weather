import { EventEmitter } from 'events'

let currentQueue

export class Queue extends EventEmitter {
  canceled = false
  finished = false

  cancel () {
    if (this.finished) return

    this.canceled = true
    this.emit('cancel')
  }

  finish () {
    if (this.canceled) return

    this.finished = true
  }

  static create () {
    if (currentQueue) {
      currentQueue.cancel()
    }

    currentQueue = new Queue()

    return currentQueue
  }
}
