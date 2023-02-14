import React from 'react'
import events from '../events'
import HTML5Backend from 'react-dnd-html5-mixed-backend'
import { DragDropContext } from 'react-dnd'
import BigCalendar from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'

import 'react-big-calendar/lib/addons/dragAndDrop/styles.less'

const DragAndDropCalendar = withDragAndDrop(BigCalendar)

class DndHa extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      events: events,
    }

    this.moveEvent = this.moveEvent.bind(this)
  }

  moveEvent({ event, start, end }) {
    const { events } = this.state

    const idx = events.indexOf(event)
    const updatedEvent = { ...event, start, end }

    const nextEvents = [...events]
    nextEvents.splice(idx, 1, updatedEvent)

    this.setState({
      events: nextEvents,
    })

    alert(`${event.title} was dropped onto ${event.start}`)
  }

  resizeEvent = (resizeType, { event, start, end }) => {
    const { events } = this.state

    const nextEvents = events.map(existingEvent => {
      return existingEvent.id == event.id
        ? { ...existingEvent, start, end }
        : existingEvent
    })

    this.setState({
      events: nextEvents,
    })
  }

  formats = {
    /* seems to be applied only on month view
    dateFormat: (date, culture, localizer) =>
      localizer.format(date, 'yyyy-MM-dd', culture),
    */

    timeGutterFormat: (date, culture, localizer) =>
      localizer.format(date, 'HH:mm', culture),
  }

  render() {
    const toHHmm = date =>
      new Date(date).toTimeString().replace(/.*(\d{2}:\d{2}):\d{2}.*/, '$1')

    const events = this.state.events.map(e =>
      Object.assign(e, {
        label: toHHmm(e.start) + ' - ' + toHHmm(e.end) + ' ' + e.title,
      })
    )

    return (
      <DragAndDropCalendar
        selectable
        events={events}
        onEventDrop={this.moveEvent}
        resizable
        onEventResize={this.resizeEvent}
        views={['month', 'week', 'day']}
        defaultView="week"
        defaultDate={new Date(2015, 3, 12)}
        formats={this.formats}
      />
    )
  }
}

export default DragDropContext(HTML5Backend)(DndHa)
