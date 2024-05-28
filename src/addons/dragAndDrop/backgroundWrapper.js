import PropTypes from 'prop-types'
import React from 'react'
import { DropTarget } from 'react-dnd'
import cn from 'classnames'

import { accessor } from '../../utils/propTypes'
import { accessor as get } from '../../utils/accessors'

import BigCalendar from '../../index'

export function getEventTimes(start, end, dropDate, type, localizer) {
  // Calculate duration between original start and end localizer
  const duration = localizer.diff(start, end)

  // If the event is dropped in a "Day" cell, preserve an event's start time by extracting the hours and minutes off
  // the original start date and add it to newDate.value
  let nextStart =
    type === 'dateCellWrapper' ? localizer.merge(dropDate, start) : dropDate

  if (type === 'dayWrapper' && window.updateDropPositionBasedOnDragPoint) {
    const {
      dragPointDistanceFromTop,
      draggedElementHeight,
    } = window.updateDropPositionBasedOnDragPoint
    if ((dragPointDistanceFromTop, draggedElementHeight)) {
      let diff = parseInt(
        (dragPointDistanceFromTop * duration) / draggedElementHeight,
        10
      )
      // Round to given step duration (15 minutes by default)
      const minStepDuration = (window.minStepDuration || 15) * 60 * 1000
      diff = Math.floor(diff / minStepDuration) * minStepDuration
      nextStart = localizer.subtract(nextStart, diff, 'milliseconds')
    }
    delete window.updateDropPositionBasedOnDragPoint
  }

  const nextEnd = localizer.add(nextStart, duration, 'milliseconds')

  return {
    start: nextStart,
    end: nextEnd,
  }
}

const propTypes = {
  connectDropTarget: PropTypes.func.isRequired,
  type: PropTypes.string,
  isOver: PropTypes.bool,
}

class DraggableBackgroundWrapper extends React.Component {
  render() {
    const { connectDropTarget, children, type, isOver } = this.props
    const BackgroundWrapper = BigCalendar.components[type]

    let resultingChildren = children
    if (isOver)
      resultingChildren = React.cloneElement(children, {
        className: cn(children.props.className, 'rbc-addons-dnd-over'),
      })

    return (
      <BackgroundWrapper>
        {connectDropTarget(resultingChildren)}
      </BackgroundWrapper>
    )
  }
}
DraggableBackgroundWrapper.propTypes = propTypes

DraggableBackgroundWrapper.contextTypes = {
  onEventDrop: PropTypes.func,
  onEventResize: PropTypes.func,
  dragDropManager: PropTypes.object,
  startAccessor: accessor,
  endAccessor: accessor,
}

function createWrapper(type) {
  function collectTarget(connect, monitor) {
    return {
      type,
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver(),
    }
  }

  const dropTarget = {
    drop(_, monitor, { props, context }) {
      window.resizeType = null
      window.over = null
      if (window.meetingDuration) {
        window.meetingDuration.innerHTML = ''
        window.meetingDuration.style.display = 'none'
      }

      const event = monitor.getItem()
      const { value, localizer } = props
      const { onEventDrop, onEventResize, startAccessor, endAccessor } = context
      const start = get(event, startAccessor)
      const end = get(event, endAccessor)

      if (monitor.getItemType() === 'event') {
        onEventDrop({
          event,
          ...getEventTimes(start, end, value, type, localizer),
        })
      }

      if (monitor.getItemType() === 'resize') {
        switch (event.type) {
          case 'resizeTop': {
            return onEventResize('drop', {
              event,
              start: value,
              end: event.end,
            })
          }
          case 'resizeBottom': {
            return onEventResize('drop', {
              event,
              start: event.start,
              end: value,
            })
          }
          case 'resizeLeft': {
            return onEventResize('drop', {
              event,
              start: value,
              end: event.end,
            })
          }
          case 'resizeRight': {
            const nextEnd = localizer.add(value, 1, 'day')
            return onEventResize('drop', {
              event,
              start: event.start,
              end: nextEnd,
            })
          }
        }

        // Catch all
        onEventResize('drop', {
          event,
          start: event.start,
          end: value,
        })
      }
    },
  }

  return DropTarget(
    ['event', 'resize'],
    dropTarget,
    collectTarget
  )(DraggableBackgroundWrapper)
}

export const DateCellWrapper = createWrapper('dateCellWrapper')
export const DayWrapper = createWrapper('dayWrapper')
