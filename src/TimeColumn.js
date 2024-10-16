import PropTypes from 'prop-types'
import React, { Component } from 'react'
import cn from 'classnames'

import { elementType, dateFormat } from './utils/propTypes'
import BackgroundWrapper from './BackgroundWrapper'
import TimeSlotGroup from './TimeSlotGroup'

export default class TimeColumn extends Component {
  static propTypes = {
    step: PropTypes.number.isRequired,
    culture: PropTypes.string,
    timeslots: PropTypes.number.isRequired,
    getNow: PropTypes.func.isRequired,
    min: PropTypes.instanceOf(Date).isRequired,
    max: PropTypes.instanceOf(Date).isRequired,
    showLabels: PropTypes.bool,
    timeGutterFormat: dateFormat,
    type: PropTypes.string.isRequired,
    className: PropTypes.string,
    resource: PropTypes.string,

    slotPropGetter: PropTypes.func,
    dayPropGetter: PropTypes.func,
    dayWrapperComponent: elementType,
    localizer: PropTypes.object,
  }
  static defaultProps = {
    step: 30,
    timeslots: 2,
    showLabels: false,
    type: 'day',
    className: '',
    dayWrapperComponent: BackgroundWrapper,
  }

  renderTimeSliceGroup(key, isNow, date, resource) {
    const {
      dayWrapperComponent,
      timeslots,
      showLabels,
      step,
      slotPropGetter,
      dayPropGetter,
      timeGutterFormat,
      culture,
    } = this.props

    return (
      <TimeSlotGroup
        key={key}
        isNow={isNow}
        value={date}
        step={step}
        slotPropGetter={slotPropGetter}
        dayPropGetter={dayPropGetter}
        culture={culture}
        timeslots={timeslots}
        resource={resource}
        showLabels={showLabels}
        timeGutterFormat={timeGutterFormat}
        dayWrapperComponent={dayWrapperComponent}
      />
    )
  }

  render() {
    const {
      className,
      children,
      style,
      getNow,
      min,
      max,
      step,
      timeslots,
      resource,
      localizer,
    } = this.props
    const totalMin = localizer.diff(min, max, 'minutes')
    const numGroups = Math.ceil(totalMin / (step * timeslots))
    const renderedSlots = []
    const groupLengthInMinutes = step * timeslots

    let date = min
    let next = date
    let now = getNow()
    let isNow = false

    for (var i = 0; i < numGroups; i++) {
      isNow = localizer.inRange(
        now,
        date,
        localizer.add(next, groupLengthInMinutes - 1, 'minutes'),
        'minutes'
      )

      next = localizer.add(date, groupLengthInMinutes, 'minutes')
      if (className === 'rbc-time-gutter' && +date === +next) {
        // Safari bug
        next = localizer.add(date, groupLengthInMinutes * 2, 'minutes')
      }
      renderedSlots.push(this.renderTimeSliceGroup(i, isNow, date, resource))

      date = next
    }

    return (
      <div className={cn(className, 'rbc-time-column')} style={style}>
        {renderedSlots}
        {children}
      </div>
    )
  }
}
