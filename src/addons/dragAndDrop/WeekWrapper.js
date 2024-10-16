import PropTypes from 'prop-types'
import React from 'react'
import { getSlotAtX, pointInBox } from '../../utils/selection'
import { findDOMNode } from 'react-dom'

import { eventSegments } from '../../utils/eventLevels'
import Selection, { getBoundsForNode } from '../../Selection'
import EventRow from '../../EventRow'
import { dragAccessors } from './common'

const propTypes = {}

const eventTimes = (event, accessors, localizer) => {
  let start = accessors.start(event)
  let end = accessors.end(event)

  const isZeroDuration =
    localizer.eq(start, end, 'minutes') && start.getMinutes() === 0
  // make zero duration midnight events at least one day long
  if (isZeroDuration) end = localizer.add(end, 1, 'day')
  return { start, end }
}

class WeekWrapper extends React.Component {
  static propTypes = {
    isAllDay: PropTypes.bool,
    slotMetrics: PropTypes.object.isRequired,
    accessors: PropTypes.object.isRequired,
    getters: PropTypes.object.isRequired,
    components: PropTypes.object.isRequired,
    resourceId: PropTypes.any,
    localizer: PropTypes.object,
  }

  static contextTypes = {
    draggable: PropTypes.shape({
      onStart: PropTypes.func,
      onEnd: PropTypes.func,
      dragAndDropAction: PropTypes.object,
      onBeginAction: PropTypes.func,
    }),
  }

  constructor(...args) {
    super(...args)
    this.state = {}
  }

  componentDidMount() {
    this._selectable()
  }

  componentWillUnmount() {
    this._teardownSelectable()
  }

  reset() {
    if (this.state.segment) this.setState({ segment: null })
  }

  update(event, start, end) {
    const segment = eventSegments(
      { ...event, end, start, __isPreview: true },
      this.props.slotMetrics.range,
      dragAccessors,
      this.props.localizer
    )

    const { segment: lastSegment } = this.state
    if (
      lastSegment &&
      segment.span === lastSegment.span &&
      segment.left === lastSegment.left &&
      segment.right === lastSegment.right
    ) {
      return
    }
    this.setState({ segment })
  }

  handleMove = ({ x, y }, node) => {
    const { event } = this.context.draggable.dragAndDropAction
    const metrics = this.props.slotMetrics
    const { accessors, localizer } = this.props

    if (!event) return

    let rowBox = getBoundsForNode(node)

    if (!pointInBox(rowBox, { x, y })) {
      this.reset()
      return
    }

    // Make sure to maintain the time of the start date while moving it to the new slot
    let start = localizer.merge(
      metrics.getDateForSlot(getSlotAtX(rowBox, x, false, metrics.slots)),
      accessors.start(event)
    )

    let end = localizer.add(
      start,
      localizer.diff(accessors.start(event), accessors.end(event), 'minutes'),
      'minutes'
    )

    this.update(event, start, end)
  }

  handleResize(point, node) {
    const { event, direction } = this.context.draggable.dragAndDropAction
    const { accessors, slotMetrics: metrics, localizer } = this.props

    let { start, end } = eventTimes(event, accessors, localizer)

    let rowBox = getBoundsForNode(node)
    let cursorInRow = pointInBox(rowBox, point)

    if (direction === 'RIGHT') {
      if (cursorInRow) {
        if (metrics.last < start) return this.reset()
        // add min
        end = localizer.add(
          metrics.getDateForSlot(
            getSlotAtX(rowBox, point.x, false, metrics.slots)
          ),
          1,
          'day'
        )
      } else if (
        localizer.inRange(start, metrics.first, metrics.last) ||
        (rowBox.bottom < point.y && +metrics.first > +start)
      ) {
        end = localizer.add(metrics.last, 1, 'milliseconds')
      } else {
        this.setState({ segment: null })
        return
      }

      end = localizer.max(end, localizer.add(start, 1, 'day'))
    } else if (direction === 'LEFT') {
      // inbetween Row
      if (cursorInRow) {
        if (metrics.first > end) return this.reset()

        start = metrics.getDateForSlot(
          getSlotAtX(rowBox, point.x, false, metrics.slots)
        )
      } else if (
        localizer.inRange(end, metrics.first, metrics.last) ||
        (rowBox.top > point.y && +metrics.last < +end)
      ) {
        start = localizer.add(metrics.first, -1, 'milliseconds')
      } else {
        this.reset()
        return
      }

      start = localizer.min(localizer.add(end, -1, 'day'), start)
    }

    this.update(event, start, end)
  }

  _selectable = () => {
    let node = findDOMNode(this)
    if (!node) return
    let closestNode = node.closest('.rbc-month-row, .rbc-allday-cell')
    if (!closestNode) return
    let container = closestNode.closest('.rbc-month-view, .rbc-time-view')

    let selector = (this._selector = new Selection(() => container))

    selector.on('beforeSelect', point => {
      const { isAllDay } = this.props
      const { action } = this.context.draggable.dragAndDropAction

      return (
        action === 'move' ||
        (action === 'resize' &&
          (!isAllDay || pointInBox(getBoundsForNode(closestNode), point)))
      )
    })

    selector.on('selecting', box => {
      const bounds = getBoundsForNode(closestNode)
      const { dragAndDropAction } = this.context.draggable

      if (dragAndDropAction.action === 'move') this.handleMove(box, bounds)
      if (dragAndDropAction.action === 'resize') this.handleResize(box, bounds)
    })

    selector.on('selectStart', () => this.context.draggable.onStart())
    selector.on('select', point => {
      const bounds = getBoundsForNode(closestNode)

      if (!this.state.segment || !pointInBox(bounds, point)) return
      this.handleInteractionEnd()
    })
    selector.on('click', () => this.context.draggable.onEnd(null))
  }

  handleInteractionEnd = () => {
    const { resourceId, isAllDay } = this.props
    const { event } = this.state.segment

    this.reset()

    this.context.draggable.onEnd({
      start: event.start,
      end: event.end,
      resourceId,
      isAllDay,
    })
  }

  _teardownSelectable = () => {
    if (!this._selector) return
    this._selector.teardown()
    this._selector = null
  }

  render() {
    const { children, accessors } = this.props

    let { segment } = this.state

    return (
      <div className="rbc-addons-dnd-row-body">
        {children}

        {segment && (
          <EventRow
            {...this.props}
            selected={null}
            className="rbc-addons-dnd-drag-row"
            segments={[segment]}
            accessors={{
              ...accessors,
              ...dragAccessors,
            }}
          />
        )}
      </div>
    )
  }
}

WeekWrapper.propTypes = propTypes

export default WeekWrapper
