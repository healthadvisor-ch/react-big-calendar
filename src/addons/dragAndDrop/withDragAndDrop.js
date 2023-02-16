/* eslint-disable no-console */
import PropTypes from 'prop-types'
import React from 'react'
import cn from 'classnames'
import _isEqual from 'lodash/isEqual'

import { accessor } from '../../utils/propTypes'
import EventWrapper from './EventWrapper'
import EventContainerWrapper from './EventContainerWrapper'
import WeekWrapper from './WeekWrapper'
import { mergeComponents } from './common'
import { DnDContext } from './DnDContext'

/**
 * Creates a higher-order component (HOC) supporting drag & drop and optionally resizing
 * of events:
 *
 * ```js
 *    import Calendar from 'react-big-calendar'
 *    import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
 *    export default withDragAndDrop(Calendar)
 * ```
 * (you can optionally pass any dnd backend as an optional second argument to `withDragAndDrop`.
 * It defaults to `react-dnd-html5-backend` which you should probably include in
 * your project if using this default).
 *
 * Set `resizable` to true in your calendar if you want events to be resizable.
 *
 * The HOC adds `onEventDrop` and `onEventResize` callback properties if the events are
 * moved or resized. They are called with these signatures:
 *
 * ```js
 *    function onEventDrop({ event, start, end, allDay }) {...}
 *    function onEventResize(type, { event, start, end, allDay }) {...}  // type is always 'drop'
 * ```
 *
 * Moving and resizing of events has some subtlety which one should be aware of.
 *
 * In some situations, non-allDay events are displayed in "row" format where they
 * are rendered horizontally. This is the case for ALL events in a month view. It
 * is also occurs with multi-day events in a day or week view (unless `showMultiDayTimes`
 * is set).
 *
 * When dropping or resizing non-allDay events into a the header area or when
 * resizing them horizontally because they are displayed in row format, their
 * times are preserved, only their date is changed.
 *
 * If you care about these corner cases, you can examine the `allDay` param suppled
 * in the callback to determine how the user dropped or resized the event.
 *
 * @param {*} Calendar
 * @param {*} backend
 */
export default function withDragAndDrop(Calendar) {
  class DragAndDropCalendar extends React.Component {
    static propTypes = {
      ...Calendar.propTypes,

      onEventDrop: PropTypes.func,
      onEventResize: PropTypes.func,
      onEventActionStart: PropTypes.func,
      onDragStart: PropTypes.func,
      onDragOver: PropTypes.func,
      onDropFromOutside: PropTypes.func,

      dragFromOutsideItem: PropTypes.func,

      draggableAccessor: accessor,
      resizableAccessor: accessor,

      selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
      resizable: PropTypes.bool,
      components: PropTypes.object,
      step: PropTypes.number,
    }

    static defaultProps = {
      ...Calendar.defaultProps,
      components: {},
      draggableAccessor: null,
      resizableAccessor: null,
      step: 30,
      resizable: true,
    }

    constructor(...args) {
      super(...args)

      const { components } = this.props

      this.components = mergeComponents(components, {
        eventWrapper: EventWrapper,
        eventContainerWrapper: EventContainerWrapper,
        weekWrapper: WeekWrapper,
      })

      this.state = { interacting: false }
    }

    // TODO is it used?
    // shouldComponentUpdate(nextProps, nextState) {
    //   return (
    //     !_isEqual(this.props, nextProps) || !_isEqual(this.state, nextState)
    //   )
    // }

    getDnDContextValue() {
      return {
        draggable: {
          onStart: this.handleInteractionStart,
          onEnd: this.handleInteractionEnd,
          onBeginAction: this.handleBeginAction,
          onDropFromOutside: this.props.onDropFromOutside,
          dragFromOutsideItem: this.props.dragFromOutsideItem,
          draggableAccessor: this.props.draggableAccessor,
          resizableAccessor: this.props.resizableAccessor,
          dragAndDropAction: this.state,
        },
      }
    }

    defaultOnDragOver = event => {
      event.preventDefault()
    }

    handleBeginAction = (event, action, direction, nativeEvent) => {
      console.log(`withDnD - handleBeginAction!`)
      this.setState({ event, action, direction, nativeEvent })
      this.props.onEventActionStart({
        event,
        action,
        direction,
      })
      const { onDragStart } = this.props
      if (onDragStart) onDragStart({ event, action, direction })
    }

    handleInteractionStart = () => {
      console.log(`withDnD - handleInteractionStart!`)
      if (this.state.interacting === false) this.setState({ interacting: true })
    }

    handleInteractionEnd = interactionInfo => {
      console.log('withDnD - handleInteractionEnd')
      const { action, event } = this.state
      if (!action) return

      this.setState({
        action: null,
        event: null,
        interacting: false,
        direction: null,
      })
      console.log(
        `with drag and drop - handle interaction end! ${interactionInfo ==
          null} action: ${action}`
      )

      if (interactionInfo == null) return

      interactionInfo.event = event
      const { onEventDrop, onEventResize } = this.props
      if (action === 'move' && onEventDrop) onEventDrop(interactionInfo)
      if (action === 'resize' && onEventResize) onEventResize(interactionInfo)
    }

    render() {
      const { selectable, elementProps, ...props } = this.props
      const { interacting } = this.state

      delete props.onEventDrop
      delete props.onEventResize
      props.selectable = selectable ? 'ignoreEvents' : false

      const elementPropsWithDropFromOutside = this.props.onDropFromOutside
        ? {
            ...elementProps,
            onDragOver: this.props.onDragOver || this.defaultOnDragOver,
          }
        : elementProps

      props.className = cn(
        props.className,
        'rbc-addons-dnd',
        !!interacting && 'rbc-addons-dnd-is-dragging'
      )

      const context = this.getDnDContextValue()
      return (
        <DnDContext.Provider value={context}>
          <Calendar
            {...props}
            elementProps={elementPropsWithDropFromOutside}
            components={this.components}
          />
        </DnDContext.Provider>
      )
    }
  }

  return DragAndDropCalendar
}
