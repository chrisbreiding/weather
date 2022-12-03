import debounce from 'lodash.debounce'
import { types } from 'mobx-state-tree'

import { totalDays } from './constants'

const ChartState = types.model('ChartState', {
  chartWidth: 0,
  endDayIndex: totalDays,
  focusedDay: types.maybeNull(types.number),
  startDayIndex: 0,
})
.views((self) => ({
  get isLoading () {
    return self.chartWidth === 0
  },

  get isAtStart () {
    return self.startDayIndex === 0
  },

  get isAtEnd () {
    return self.endDayIndex === totalDays
  },

  get dayWidth () {
    return self.chartWidth / (self.endDayIndex - self.startDayIndex)
  },

  get dayContainerWidth () {
    return self.dayWidth * totalDays
  },

  get shiftAmount () {
    return self.startDayIndex * self.dayWidth
  },

  get shouldAnimate () {
    return !self.isLoading && !self.isResizing
  },
}))
.actions((self) => ({
  shiftDays (amount) {
    self.startDayIndex = self.startDayIndex + amount
    self.endDayIndex = self.endDayIndex + amount
  },

  shiftDaysLeft () {
    if (self.isAtStart) return

    self.clearFocusedDay()

    const numDays = self.endDayIndex - self.startDayIndex
    const toStart = self.startDayIndex

    if (toStart <= numDays) {
      self.shiftDays(-toStart)
    } else {
      self.shiftDays(-numDays)
    }
  },

  shiftDaysRight () {
    if (self.isAtEnd) return

    self.clearFocusedDay()

    const numDays = self.endDayIndex - self.startDayIndex
    const toEnd = totalDays - self.endDayIndex

    if (toEnd <= numDays) {
      self.shiftDays(toEnd)
    } else {
      self.shiftDays(numDays)
    }
  },

  setChartWidth () {
    const chartDefs = document.querySelector('#recharts1-clip rect')

    if (!chartDefs) {
      return setTimeout(self.setChartWidth, 50)
    }

    const width = chartDefs.getAttribute('width')

    self.chartWidth = Number(width)
  },

  setNumDays () {
    const width = document.body.clientWidth
    const numDays = width > 860 ? 10
      : width > 810 && width <= 860 ? 9
        : width > 720 && width <= 810 ? 8
          : width > 630 && width <= 720 ? 7
            : width > 540 && width <= 630 ? 6
              : width > 450 && width <= 540 ? 5
                : 4

    if (self.startDayIndex + numDays <= totalDays) {
      self.endDayIndex = self.startDayIndex + numDays
    } else {
      self.endDayIndex = totalDays
      self.startDayIndex = self.endDayIndex - numDays
    }

    self.setChartWidth()
  },

  setFocusedDay (day) {
    self.focusedDay = day.time === self.focusedDay ? null : day.time
  },

  clearFocusedDay () {
    self.setFocusedDay({ time: null })
  },
}))

export const chartState = ChartState.create()

window.addEventListener('resize', debounce(chartState.setNumDays, 100))
chartState.setNumDays()
