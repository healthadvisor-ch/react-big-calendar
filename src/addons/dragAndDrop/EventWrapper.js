import PropTypes from 'prop-types'
import React from 'react'
import cn from 'classnames'
import { accessor } from '../../utils/propTypes'
import { accessor as get } from '../../utils/accessors'

class EventWrapper extends React.Component {
  static contextTypes = {
    draggable: PropTypes.shape({
      onStart: PropTypes.func,
      onEnd: PropTypes.func,
      onBeginAction: PropTypes.func,
      draggableAccessor: accessor,
      resizableAccessor: accessor,
      dragAndDropAction: PropTypes.object,
    }),
  }

  static propTypes = {
    type: PropTypes.oneOf(['date', 'time']),
    event: PropTypes.object.isRequired,

    draggable: PropTypes.bool,
    allDay: PropTypes.bool,
    isRow: PropTypes.bool,
    continuesPrior: PropTypes.bool,
    continuesAfter: PropTypes.bool,
    isDragging: PropTypes.bool,
    isResizing: PropTypes.bool,
  }

  handleResizeUp = e => {
    if (e.button !== 0) return
    this.handleBeginAction(e, 'resize', 'UP')
  }
  handleResizeDown = e => {
    if (e.button !== 0) return
    this.handleBeginAction(e, 'resize', 'DOWN')
  }
  handleResizeLeft = e => {
    if (e.button !== 0) return
    this.handleBeginAction(e, 'resize', 'LEFT')
  }
  handleResizeRight = e => {
    if (e.button !== 0) return
    this.handleBeginAction(e, 'resize', 'RIGHT')
  }
  handleStartDragging = e => {
    // If it's a mouse event but not left button was clicked
    if (e.type === 'mousedown' && e.button !== 0) return

    const isResizeHandle = e.target.className.includes('rbc-addons-dnd-resize')
    if (!isResizeHandle) {
      this.handleBeginAction(e, 'move')
    }
  }

  handleBeginAction = (e, action, direction) => {
    const lastNativeEvent = this.context.draggable.dragAndDropAction.nativeEvent

    const nativeEvent = e.nativeEvent.type
    const touchEndThenMouseDown =
      lastNativeEvent === 'touchend' && nativeEvent === 'mousedown'
    const { interacting } = this.context.draggable.dragAndDropAction

    this.context.draggable.onBeginAction(
      this.props.event,
      action,
      direction,
      nativeEvent
    )

    if ((nativeEvent === 'touchend' && !interacting) || touchEndThenMouseDown) {
      this.context.draggable.onEnd(null)
    }
  }

  renderAnchor(direction) {
    const cls = direction === 'Up' || direction === 'Down' ? 'ns' : 'ew'
    return (
      <div
        className={`rbc-addons-dnd-resize-${cls}-anchor`}
        onMouseDown={this[`handleResize${direction}`]}
      >
        <div className={`rbc-addons-dnd-resize-${cls}-icon`} />
      </div>
    )
  }

  render() {
    const { event, type, continuesPrior, continuesAfter } = this.props

    let { children } = this.props

    if (event.__isPreview)
      return React.cloneElement(children, {
        className: cn(children.props.className, 'rbc-addons-dnd-drag-preview'),
      })

    const { draggableAccessor, resizableAccessor, draggable } = this.context

    const isDraggable = draggableAccessor
      ? !!get(event, draggableAccessor)
      : true

    /* Event is not draggable, no need to wrap it */
    if (!isDraggable) {
      return children
    }

    let StartAnchor = null
    let EndAnchor = null

    /*
     * The resizability of events depends on whether they are
     * allDay events and how they are displayed.
     *
     * 1. If the event is being shown in an event row (because
     * it is an allDay event shown in the header row or because as
     * in month view the view is showing all events as rows) then we
     * allow east-west resizing.
     *
     * 2. Otherwise the event is being displayed
     * normally, we can drag it north-south to resize the times.
     *
     * See `DropWrappers` for handling of the drop of such events.
     *
     * Notwithstanding the above, we never show drag anchors for
     * events which continue beyond current component. This happens
     * in the middle of events when showMultiDay is true, and to
     * events at the edges of the calendar's min/max location.
     */
    const isResizable = resizableAccessor
      ? !!get(event, resizableAccessor)
      : true

    if (isResizable) {
      if (type === 'date') {
        StartAnchor = !continuesPrior && this.renderAnchor('Left')
        EndAnchor = !continuesAfter && this.renderAnchor('Right')
      } else {
        StartAnchor = !continuesPrior && this.renderAnchor('Up')
        EndAnchor = !continuesAfter && this.renderAnchor('Down')
      }

      /*
       * props.children is the singular <Event> component.
       * BigCalendar positions the Event abolutely and we
       * need the anchors to be part of that positioning.
       * So we insert the anchors inside the Event's children
       * rather than wrap the Event here as the latter approach
       * would lose the positioning.
       */
      const newProps = {
        onMouseDown: this.handleStartDragging,
        onTouchStart: this.handleStartDragging,
        onTouchEnd: this.handleStartDragging,
        // replace original event child with anchor-embellished child

        children: (
          <div className="rbc-addons-dnd-resizable">
            {StartAnchor}
            {children.props.children}
            {EndAnchor}
          </div>
        ),
      }

      if (
        draggable.dragAndDropAction.interacting && // if an event is being dragged right now
        draggable.dragAndDropAction.event === event // and it's the current event
      ) {
        // add a new class to it
        newProps.className = cn(
          children.props.className,
          'rbc-addons-dnd-dragged-event'
        )
      }

      children = React.cloneElement(children, newProps)
    }

    return children
  }
}

export default EventWrapper
