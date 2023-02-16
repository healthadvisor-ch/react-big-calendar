/* eslint-disable no-console */
import _defaults from 'lodash/defaults'
import cn from 'classnames'
import React from 'react'

function stringifyPercent(v) {
  return typeof v === 'string' ? v : v + '%'
}

/* eslint-disable react/prop-types */
class TimeGridEvent extends React.Component {
  state = {}

  render() {
    const {
      style,
      className,
      event,
      accessors,
      rtl,
      selected,
      label,
      continuesPrior,
      continuesAfter,
      getters,
      onClick,
      onDoubleClick,
      resourceId,
      components: { event: Event, eventWrapper: EventWrapper },
    } = this.props
    let title = accessors.title(event)
    let tooltip = accessors.tooltip(event)
    let end = accessors.end(event)
    let start = accessors.start(event)
    let icon = event.icon

    let userProps = getters.eventProp(event, start, end, selected, resourceId)

    let { height, top, width, xOffset } = style
    const inner = [
      <div key="1" className="rbc-event-label">
        {[
          icon && (
            <i className="material-icons" key={icon}>
              {icon}
            </i>
          ),
          event.label || label,
        ]}
      </div>,
      <div key="2" className="rbc-event-content">
        {Event ? <Event event={event} title={title} /> : title}
      </div>,
    ]

    // treat < 400 ms touches on events as clicks on touch devices
    // let { timestamp } = this.state
    // let onTouchStart = e => {
    //   console.log(`TGE - onTouchStart: ${e.pointerType}`)
    //   this.setState({ timestamp: Date.now() })
    // }
    // let onTouchEnd = e => {
    //   console.log(`TGE - onTouchEnd: ${e.pointerType}`)
    //   if (e.pointerType === 'mouse') {
    //     return
    //   }
    //   let now = Date.now()
    //   if (now - timestamp < 400) {
    //     console.log('TGE - onClick!')
    //     onClick(e)
    //   }
    // }

    return (
      <EventWrapper type="time" {...this.props}>
        <div
          onClick={e => {
            onClick(e)
            // const now = Date.now()
            // if (now - timestamp < 400) {
            //   onClick(e)
            // } else {
            //   e.stopPropagation()
            //   e.preventDefault()
            // }
            // this.setState({ timestamp: 0 })
          }}
          // onPointerDown={onTouchStart}
          // onPointerUp={onTouchEnd}
          onDoubleClick={onDoubleClick}
          style={_defaults({}, userProps.style, {
            top: stringifyPercent(top),
            height: stringifyPercent(height),
            [rtl ? 'right' : 'left']: stringifyPercent(Math.max(0, xOffset)),
            width: stringifyPercent(width),
            maxWidth: userProps.style.left
              ? `calc(100% - ${userProps.style.left})`
              : '100%',
          })}
          title={
            tooltip
              ? (typeof label === 'string' ? label + ': ' : '') + tooltip
              : undefined
          }
          className={cn('rbc-event', className, userProps.className, {
            'rbc-selected': selected,
            'rbc-event-continues-earlier': continuesPrior,
            'rbc-event-continues-later': continuesAfter,
          })}
        >
          {inner}
        </div>
      </EventWrapper>
    )
  }
}

export default TimeGridEvent
