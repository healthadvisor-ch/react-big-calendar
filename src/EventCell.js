import PropTypes from 'prop-types'
import React from 'react'
import cn from 'classnames'

let propTypes = {
  event: PropTypes.object.isRequired,
  slotStart: PropTypes.instanceOf(Date),
  slotEnd: PropTypes.instanceOf(Date),

  selected: PropTypes.bool,
  isAllDay: PropTypes.bool,
  continuesPrior: PropTypes.bool,
  continuesAfter: PropTypes.bool,

  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,

  onSelect: PropTypes.func,
  onDoubleClick: PropTypes.func,
}

class EventCell extends React.Component {
  render() {
    let {
      style,
      className,
      event,
      selected,
      isAllDay,
      onSelect,
      onDoubleClick,
      localizer,
      continuesPrior,
      continuesAfter,
      accessors,
      getters,
      children,
      components: { event: Event, eventWrapper: EventWrapper },
      ...props
    } = this.props

    let title = accessors.title(event)
    let tooltip = accessors.tooltip(event)
    let end = accessors.end(event)
    let start = accessors.start(event)
    let allDay = accessors.allDay(event)
    let icon = event.icon

    let showAsAllDay =
      isAllDay ||
      allDay ||
      localizer.diff(start, localizer.ceil(end, 'day'), 'day') > 1

    let userProps = getters.eventProp(event, start, end, selected)

    const content = (
      <div className="rbc-event-content" title={tooltip || undefined}>
        {Event ? (
          <Event
            event={event}
            title={title}
            isAllDay={allDay}
            localizer={localizer}
          />
        ) : (
          [
            icon && (
              <i className="material-icons" key={icon}>
                {icon}
              </i>
            ),
            event.label || title,
          ]
        )}
      </div>
    )

    return (
      <EventWrapper {...this.props} type="date">
        <button
          {...props}
          style={{ ...userProps.style, ...style }}
          className={cn('rbc-event', className, userProps.className, {
            'rbc-selected': selected,
            'rbc-event-allday': showAsAllDay,
            'rbc-event-continues-prior': continuesPrior,
            'rbc-event-continues-after': continuesAfter,
          })}
          onClick={e => onSelect && onSelect(event, e)}
          onDoubleClick={e => onDoubleClick && onDoubleClick(event, e)}
        >
          {typeof children === 'function' ? children(content) : content}
        </button>
      </EventWrapper>
    )
  }
}

EventCell.propTypes = propTypes

export default EventCell
