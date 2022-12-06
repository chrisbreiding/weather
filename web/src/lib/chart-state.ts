import debounce from 'lodash.debounce'
import { action, computed, makeObservable, observable } from 'mobx'

import { totalDays } from './constants'

class ChartState {
  chartWidth = 0
  endDayIndex = totalDays
  focusedDay?: number
  startDayIndex = 0

  constructor () {
    makeObservable(this, {
      chartWidth: observable,
      endDayIndex: observable,
      focusedDay: observable,
      startDayIndex: observable,

      isLoading: computed,
      isAtStart: computed,
      isAtEnd: computed,
      dayWidth: computed,
      dayContainerWidth: computed,
      shiftAmount: computed,

      shiftDays: action,
      shiftDaysLeft: action,
      shiftDaysRight: action,
      setChartWidth: action,
      setNumDays: action,
      setFocusedDay: action,
      clearFocusedDay: action,
    })
  }

  get isLoading () {
    return this.chartWidth === 0
  }

  get isAtStart () {
    return this.startDayIndex === 0
  }

  get isAtEnd () {
    return this.endDayIndex === totalDays
  }

  get dayWidth () {
    return this.chartWidth / (this.endDayIndex - this.startDayIndex)
  }

  get dayContainerWidth () {
    return this.dayWidth * totalDays
  }

  get shiftAmount () {
    return this.startDayIndex * this.dayWidth
  }

  shiftDays (amount: number) {
    this.startDayIndex = this.startDayIndex + amount
    this.endDayIndex = this.endDayIndex + amount
  }

  shiftDaysLeft = () => {
    if (this.isAtStart) return

    this.clearFocusedDay()

    const numDays = this.endDayIndex - this.startDayIndex
    const toStart = this.startDayIndex

    if (toStart <= numDays) {
      this.shiftDays(-toStart)
    } else {
      this.shiftDays(-numDays)
    }
  }

  shiftDaysRight = () => {
    if (this.isAtEnd) return

    this.clearFocusedDay()

    const numDays = this.endDayIndex - this.startDayIndex
    const toEnd = totalDays - this.endDayIndex

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

  setNumDays = () => {
    const width = document.body.clientWidth
    const numDays = width > 860 ? 10
      : width > 810 && width <= 860 ? 9
        : width > 720 && width <= 810 ? 8
          : width > 630 && width <= 720 ? 7
            : width > 540 && width <= 630 ? 6
              : width > 450 && width <= 540 ? 5
                : 4

    if (this.startDayIndex + numDays <= totalDays) {
      this.endDayIndex = this.startDayIndex + numDays
    } else {
      this.endDayIndex = totalDays
      this.startDayIndex = this.endDayIndex - numDays
    }

    this.setChartWidth()
  }

  setFocusedDay (day: { time?: number }) {
    this.focusedDay = day.time === this.focusedDay ? undefined : day.time
  }

  clearFocusedDay () {
    this.setFocusedDay({})
  }
}

export const chartState = new ChartState()

window.addEventListener('resize', debounce(chartState.setNumDays, 100))
chartState.setNumDays()
