/* eslint-disable no-console */
import PropTypes from 'prop-types'
import React from 'react'
import dates from '../../utils/dates'

import Selection, {
  getBoundsForNode,
  getEventNodeFromPoint,
} from '../../Selection'
import TimeGridEvent from '../../TimeGridEvent'
import { dragAccessors } from './common'
import NoopWrapper from '../../NoopWrapper'

const pointInColumn = (bounds, { x, y }) => {
  const { left, right, top } = bounds
  return x < right + 10 && x > left && y > top
}
const propTypes = {}

class EventContainerWrapper extends React.Component {
  static propTypes = {
    accessors: PropTypes.object.isRequired,
    components: PropTypes.object.isRequired,
    getters: PropTypes.object.isRequired,
    localizer: PropTypes.object.isRequired,
    slotMetrics: PropTypes.object.isRequired,
    resource: PropTypes.any,
  }

  static contextTypes = {
    draggable: PropTypes.shape({
      onStart: PropTypes.func,
      onEnd: PropTypes.func,
      onBeginAction: PropTypes.func,
      dragAndDropAction: PropTypes.object,
    }),
  }

  constructor(...args) {
    super(...args)
    this.state = {}
    this.ref = React.createRef()
  }

  componentDidMount() {
    this._selectable()
  }

  componentWillUnmount() {
    this._teardownSelectable()
  }

  reset() {
    if (this.state.event)
      this.setState({ event: null, top: null, height: null })
  }

  update(event, { startDate, endDate, top, height }) {
    const { event: lastEvent } = this.state
    if (
      lastEvent &&
      startDate === lastEvent.start &&
      endDate === lastEvent.end
    ) {
      return
    }

    this.setState({
      top,
      height,
      event: { ...event, start: startDate, end: endDate },
    })
  }

  handleMove = (point, bounds) => {
    console.log('ECW - handlemove')
    if (!pointInColumn(bounds, point)) this.reset()
    const { event } = this.context.draggable.dragAndDropAction
    const { accessors, slotMetrics } = this.props

    const newSlot = slotMetrics.closestSlotFromPoint(
      { y: point.y - this.eventOffsetTop, x: point.x },
      bounds
    )

    let eventStart = accessors.start(event)
    let eventEnd = accessors.end(event)
    let end = dates.add(
      newSlot,
      dates.diff(eventStart, eventEnd, 'minutes'),
      'minutes'
    )

    this.update(event, slotMetrics.getRange(newSlot, end))
  }

  handleResize(point, boundaryBox) {
    // TODO shall we move start/end computation to eventTimes function?
    let start, end
    const { accessors, slotMetrics } = this.props
    const { event, direction } = this.context.draggable.dragAndDropAction
    console.log(`ECW - handleResize - direction ${direction}`)

    let currentSlot = slotMetrics.closestSlotFromPoint(point, boundaryBox)
    if (direction === 'UP') {
      end = accessors.end(event)
      start = dates.min(currentSlot, slotMetrics.closestSlotFromDate(end, -1))
    } else if (direction === 'DOWN') {
      start = accessors.start(event)
      end = dates.max(currentSlot, slotMetrics.closestSlotFromDate(start))
    }

    this.update(event, slotMetrics.getRange(start, end))
  }

  _selectable = () => {
    let wrapper = this.ref.current
    let node = wrapper.children[0]
    let isBeingDragged = false
    let selector = (this._selector = new Selection(() =>
      wrapper.closest('.rbc-time-view')
    ))

    selector.on('beforeSelect', point => {
      console.log('ECW - on beforeselect')
      const { dragAndDropAction } = this.context.draggable

      if (!dragAndDropAction.action) return false
      if (dragAndDropAction.action === 'resize') {
        return pointInColumn(getBoundsForNode(node), point)
      }

      const eventNode = getEventNodeFromPoint(node, point)
      if (!eventNode) return false

      // eventOffsetTop is distance from the top of the event to the initial
      // mouseDown position. We need this later to compute the new top of the
      // event during move operations, since the final location is really a
      // delta from this point. note: if we want to DRY this with WeekWrapper,
      // probably better just to capture the mouseDown point here and do the
      // placement computation in handleMove()...
      this.eventOffsetTop = point.y - getBoundsForNode(eventNode).top
    })

    selector.on('selecting', box => {
      const bounds = getBoundsForNode(node)
      const { dragAndDropAction } = this.context.draggable
      console.log(`ECW - on selecting ${dragAndDropAction.action}`)

      if (dragAndDropAction.action === 'move') this.handleMove(box, bounds)
      if (dragAndDropAction.action === 'resize') this.handleResize(box, bounds)
    })

    selector.on('selectStart', () => {
      console.log('ECW - on  select start')
      isBeingDragged = true
      this.context.draggable.onStart()
    })

    selector.on('select', point => {
      console.log('ECW - on select')
      const bounds = getBoundsForNode(node)
      isBeingDragged = false
      const { dragAndDropAction } = this.context.draggable
      if (dragAndDropAction.action === 'resize') {
        this.handleInteractionEnd()
      } else if (!this.state.event || !pointInColumn(bounds, point)) {
        return
      } else {
        this.handleInteractionEnd()
      }
    })

    selector.on('click', () => {
      console.log('ECW - on click')
      if (isBeingDragged) this.reset()
      this.context.draggable.onEnd(null)
    })

    selector.on('reset', () => {
      console.log('ECW - on reset')
      this.reset()
      this.context.draggable.onEnd(null)
    })
  }

  handleInteractionEnd = () => {
    const { resource } = this.props
    const { event } = this.state
    this.reset()

    this.context.draggable.onEnd({
      start: event.start,
      end: event.end,
      resourceId: resource,
    })
  }

  _teardownSelectable = () => {
    if (!this._selector) return
    this._selector.teardown()
    this._selector = null
  }

  renderContent() {
    const {
      children,
      accessors,
      components,
      getters,
      slotMetrics,
      localizer,
    } = this.props

    let { event, top, height } = this.state
    if (!event) return children

    const events = children.props.children
    const { start, end } = event

    let label
    let format = 'eventTimeRangeFormat'

    const startsBeforeDay = slotMetrics.startsBeforeDay(start)
    const startsAfterDay = slotMetrics.startsAfterDay(end)

    if (startsBeforeDay) format = 'eventTimeRangeEndFormat'
    else if (startsAfterDay) format = 'eventTimeRangeStartFormat'

    if (startsBeforeDay && startsAfterDay) label = localizer.messages.allDay
    else label = localizer.format({ start, end }, format)

    return React.cloneElement(children, {
      children: (
        <React.Fragment>
          {events}

          {event && (
            <TimeGridEvent
              event={event}
              label={label}
              className="rbc-addons-dnd-drag-preview"
              style={{ top, height, width: 100 }}
              getters={getters}
              components={{ ...components, eventWrapper: NoopWrapper }}
              accessors={{ ...accessors, ...dragAccessors }}
              continuesPrior={startsBeforeDay}
              continuesAfter={startsAfterDay}
            />
          )}
        </React.Fragment>
      ),
    })
  }

  render() {
    return <div ref={this.ref}>{this.renderContent()}</div>
  }
}

EventContainerWrapper.propTypes = propTypes

export default EventContainerWrapper
