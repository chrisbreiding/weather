import { computed, makeObservable, observable } from 'mobx'

const paragraphRegex = /(\*|\s\.\.\.|\.\.\.\s)/

export interface AlertProps {
  title: string
  messages: string[]
  time: number
  expires: number
}

export class Alert {
  title: string
  messages: string[]
  time: number
  expires: number

  constructor (props: AlertProps) {
    this.title = props.title
    this.messages = props.messages
    this.time = props.time
    this.expires = props.expires

    makeObservable(this, {
      title: observable,
      messages: observable,
      time: observable,
      expires: observable,

      id: computed,
      descriptionParagraphs: computed,
    })
  }

  get id () {
    return `${this.title}${this.time}${this.expires}`
  }

  get descriptionParagraphs () {
    return this.messages
    .map((message) => {
      return message
      .split(paragraphRegex)
      .map((paragraph) => paragraph.trim().replace(/^\.\.?\.?/, ''))
      .filter((paragraph) => !!paragraph && paragraph !== '*' && paragraph !== '...')
    })
    .flat()
  }
}
