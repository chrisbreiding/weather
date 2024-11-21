import debounce from 'lodash.debounce'
import { action, computed, makeObservable, observable } from 'mobx'
import { initialDays } from './constants'

class ChartState {
  _startDayIndex = 0
  chartWidth = 0
  focusedDay?: number
  totalDays = initialDays
  viewportWidth = 0

  constructor () {
    makeObservable(this, {
      _startDayIndex: observable,
      chartWidth: observable,
      focusedDay: observable,
      totalDays: observable,
      viewportWidth: observable,

      dayContainerWidth: computed,
      dayWidth: computed,
      endDayIndex: computed,
      isAtEnd: computed,
      isAtStart: computed,
      isLoading: computed,
      numDaysDisplayed: computed,
      shiftAmount: computed,
      startDayIndex: computed,

      clearFocusedDay: action,
      setChartWidth: action,
      setFocusedDay: action,
      setTotalDays: action,
      setViewPortWidth: action,
      shiftDays: action,
      shiftDaysLeft: action,
      shiftDaysRight: action,
    })
  }

  get isLoading () {
    return this.chartWidth === 0
  }

  get isAtStart () {
    return this.startDayIndex === 0
  }

  get isAtEnd () {
    return this.endDayIndex === this.totalDays
  }

  get dayWidth () {
    return this.chartWidth / (this.endDayIndex - this.startDayIndex)
  }

  get startDayIndex () {
    if (this._startDayIndex + this.numDaysDisplayed > this.totalDays) {

      return this.endDayIndex - this.numDaysDisplayed
    }

    return this._startDayIndex
  }

  get endDayIndex () {
    if (this._startDayIndex + this.numDaysDisplayed <= this.totalDays) {
      return this._startDayIndex + this.numDaysDisplayed
    } else {
      return this.totalDays
    }
  }

  get dayContainerWidth () {
    return this.dayWidth * this.totalDays
  }

  get shiftAmount () {
    return this.startDayIndex * this.dayWidth
  }

  get numDaysDisplayed () {
    const viewportWidth = this.viewportWidth
    const totalDays = this.totalDays
    const breakpoints = [
      { width: 860, days: 10 > totalDays ? totalDays : 10 },
      { width: 810, days: 9 > totalDays ? totalDays : 9 },
      { width: 720, days: 8 > totalDays ? totalDays : 8 },
      { width: 630, days: 7 > totalDays ? totalDays : 7 },
      { width: 540, days: 6 > totalDays ? totalDays : 6 },
      { width: 450, days: 5 > totalDays ? totalDays : 5 },
    ]

    return breakpoints.find((point) => viewportWidth > point.width)?.days ?? 4
  }

  shiftDays (amount: number) {
    this._startDayIndex = this._startDayIndex + amount
  }

  shiftDaysLeft = () => {
    if (this.isAtStart) return

    this.clearFocusedDay()

    const numDays = this.endDayIndex - this._startDayIndex
    const toStart = this._startDayIndex

    if (toStart <= numDays) {
      this.shiftDays(-toStart)
    } else {
      this.shiftDays(-numDays)
    }
  }

  shiftDaysRight = () => {
    if (this.isAtEnd) return

    this.clearFocusedDay()

    const numDays = this.endDayIndex - this._startDayIndex
    const toEnd = this.totalDays - this.endDayIndex

    if (toEnd <= numDays) {
      this.shiftDays(toEnd)
    } else {
      this.shiftDays(numDays)
    }
  }

  setChartWidth = () => {
    const chartDefs = document.querySelector('#recharts1-clip rect')

    if (!chartDefs) {
      return setTimeout(this.setChartWidth, 50)
    }

    const width = chartDefs.getAttribute('width')

    this.chartWidth = Number(width)
  }

  setTotalDays (days: number) {
    this.totalDays = days
  }

  setViewPortWidth = () => {
    this.viewportWidth = document.body.clientWidth

    this.setChartWidth()
  }

  setFocusedDay (day: { time?: number }) {
    this.focusedDay = day.time === this.focusedDay ? undefined : day.time
  }

  get hasFocusedDay () {
    return this.focusedDay !== undefined
  }

  clearFocusedDay () {
    this.setFocusedDay({})
  }
}

export const chartState = new ChartState()

window.addEventListener('resize', debounce(chartState.setViewPortWidth, 10))
chartState.setViewPortWidth()
