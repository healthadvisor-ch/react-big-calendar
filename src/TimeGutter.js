import cn from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import * as TimeSlotUtils from './utils/TimeSlots'
import TimeSlotGroup from './TimeSlotGroup'

export default class TimeGutter extends Component {
  static propTypes = {
    min: PropTypes.instanceOf(Date).isRequired,
    max: PropTypes.instanceOf(Date).isRequired,
    timeslots: PropTypes.number.isRequired,
    step: PropTypes.number.isRequired,
    getNow: PropTypes.func.isRequired,
    components: PropTypes.object.isRequired,

    localizer: PropTypes.object.isRequired,
    resource: PropTypes.string,
  }

  constructor(...args) {
    super(...args)

    const { min, max, timeslots, step, localizer } = this.props
    this.slotMetrics = TimeSlotUtils.getSlotMetrics({
      min,
      max,
      timeslots,
      step,
      localizer,
    })
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.slotMetrics = this.slotMetrics.update(nextProps)
  }

  renderSlot = (value, idx) => {
    if (idx !== 0) return null
    const { localizer, getNow } = this.props

    const isNow = getNow().getHours() === value.getHours()
    return (
      <span className={cn('rbc-label', isNow && 'rbc-now')}>
        {localizer.format(value, 'timeGutterFormat')}
      </span>
    )
  }

  render() {
    const { resource, components } = this.props

    return (
      <div className="rbc-time-gutter rbc-time-column">
        {this.slotMetrics.groups.map((grp, idx) => {
          return (
            <TimeSlotGroup
              key={idx}
              group={grp}
              resource={resource}
              components={components}
              renderSlot={this.renderSlot}
            />
          )
        })}
      </div>
    )
  }
}
