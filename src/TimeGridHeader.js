import PropTypes from 'prop-types'
import cn from 'classnames'
import scrollbarSize from 'dom-helpers/util/scrollbarSize'
import React from 'react'

import dates from './utils/dates'
import DateContentRow from './DateContentRow'
import Header from './Header'
import ResourceHeader from './ResourceHeader'
import { inRange } from './utils/eventLevels'
import { notify } from './utils/helpers'

class TimeGridHeader extends React.Component {
  static propTypes = {
    range: PropTypes.array.isRequired,
    events: PropTypes.array.isRequired,
    resources: PropTypes.object,
    resourcesGroupBy: PropTypes.oneOf(['date', 'resource']).isRequired,
    getNow: PropTypes.func.isRequired,
    isOverflowing: PropTypes.bool,

    rtl: PropTypes.bool,
    width: PropTypes.number,

    localizer: PropTypes.object.isRequired,
    accessors: PropTypes.object.isRequired,
    components: PropTypes.object.isRequired,
    getters: PropTypes.object.isRequired,

    selected: PropTypes.object,
    selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
    longPressThreshold: PropTypes.number,

    onSelectSlot: PropTypes.func,
    onSelectEvent: PropTypes.func,
    onDoubleClickEvent: PropTypes.func,
    onDrillDown: PropTypes.func,
    getDrilldownView: PropTypes.func.isRequired,
    scrollRef: PropTypes.any,
  }

  handleHeaderClick = (date, view, e) => {
    e.preventDefault()
    notify(this.props.onDrillDown, [date, view])
  }

  renderHeaderCells(range) {
    return range.map((date, i) => this.renderHeaderSingleCell(date, i))
  }

  renderHeaderSingleCell(date, i) {
    let {
      localizer,
      getDrilldownView,
      getNow,
      getters: { dayProp },
      components: { header: HeaderComponent = Header },
    } = this.props

    const today = getNow()

    let drilldownView = getDrilldownView(date)
    let label = localizer.format(date, 'dayFormat')

    const { className, style } = dayProp(date)

    let header = (
      <HeaderComponent date={date} label={label} localizer={localizer} />
    )

    return (
      <div
        key={i}
        style={style}
        className={cn(
          'rbc-header',
          className,
          dates.eq(date, today, 'day') && 'rbc-today'
        )}
      >
        {drilldownView ? (
          <a
            href="#"
            onClick={e => this.handleHeaderClick(date, drilldownView, e)}
          >
            {header}
          </a>
        ) : (
          <span>{header}</span>
        )}
      </div>
    )
  }

  renderRow = resource => {
    let {
      events,
      rtl,
      selectable,
      getNow,
      range,
      getters,
      localizer,
      accessors,
      components,
    } = this.props

    const resourceId = accessors.resourceId(resource)
    let eventsToDisplay = resource
      ? events.filter(event => accessors.resource(event) === resourceId)
      : events

    return (
      <DateContentRow
        isAllDay
        rtl={rtl}
        getNow={getNow}
        minRows={2}
        range={range}
        events={eventsToDisplay}
        resourceId={resourceId}
        className="rbc-allday-cell"
        selectable={selectable}
        selected={this.props.selected}
        components={components}
        accessors={accessors}
        getters={getters}
        localizer={localizer}
        onSelect={this.props.onSelectEvent}
        onDoubleClick={this.props.onDoubleClickEvent}
        onSelectSlot={this.props.onSelectSlot}
        longPressThreshold={this.props.longPressThreshold}
      />
    )
  }

  getDateContentRow(groupedEvents, resource, resourceId, range) {
    const {
      rtl,
      getNow,
      accessors,
      selectable,
      components,
      getters,
      localizer,
    } = this.props

    return (
      <DateContentRow
        isAllDay
        rtl={rtl}
        getNow={getNow}
        minRows={2}
        range={range}
        events={groupedEvents.get(resourceId) || []}
        resourceId={resource && resourceId}
        className="rbc-allday-cell"
        selectable={selectable}
        selected={this.props.selected}
        components={components}
        accessors={accessors}
        getters={getters}
        localizer={localizer}
        onSelect={this.props.onSelectEvent}
        onDoubleClick={this.props.onDoubleClickEvent}
        onSelectSlot={this.props.onSelectSlot}
        longPressThreshold={this.props.longPressThreshold}
      />
    )
  }

  getEventsForDay(events, date) {
    const { accessors } = this.props

    const allDayEvents = []

    const end = new Date(date.getTime())
    end.setSeconds(end.getSeconds() + 23 * 2600 + 59 * 60 + 59)

    events.forEach(event => {
      if (inRange(event, date, end, accessors)) {
        let eStart = accessors.start(event),
          eEnd = accessors.end(event)

        if (
          accessors.allDay(event) ||
          (dates.isJustDate(eStart) && dates.isJustDate(eEnd))
        ) {
          allDayEvents.push(event)
        }
      }
    })

    return allDayEvents
  }

  renderGroupedByDate() {
    const {
      accessors,
      events,
      range,
      resources,
      components: { resourceHeader: ResourceHeaderComponent = ResourceHeader },
    } = this.props

    return range.map((date, rangeIndex) => (
      <div
        className={cn(
          'rbc-time-header-content',
          resources.length > 1 && 'rbc-time-header-content-last-in-resource'
        )}
        key={rangeIndex}
      >
        <div className="rbc-row rbc-time-header-cell">
          {this.renderHeaderSingleCell(date, rangeIndex)}
        </div>
        <div className="rbc-row rbc-row-resource">
          {resources.map(([id, resource], idx) => (
            <div className="rbc-header" key={id}>
              {resource && (
                <ResourceHeaderComponent
                  index={idx}
                  label={accessors.resourceTitle(resource)}
                  resource={resource}
                />
              )}
              {this.getDateContentRow(
                resources.groupEvents(this.getEventsForDay(events, date)),
                resource,
                id,
                [date]
              )}
            </div>
          ))}
        </div>
      </div>
    ))
  }

  renderGroupedByResource() {
    const {
      accessors,
      events,
      range,
      resources,
      components: { resourceHeader: ResourceHeaderComponent = ResourceHeader },
    } = this.props

    const groupedEvents = resources.groupEvents(events)

    return resources.map(([id, resource], idx) => (
      <div className="rbc-time-header-content" key={id || idx}>
        {resource && (
          <div className="rbc-row rbc-row-resource" key={`resource_${idx}`}>
            <div className="rbc-header">
              <ResourceHeaderComponent
                index={idx}
                label={accessors.resourceTitle(resource)}
                resource={resource}
              />
            </div>
          </div>
        )}
        {/* For rendering only one day no need to show the headers */}
        {range.length > 1 && (
          <div className="rbc-row rbc-time-header-cell">
            {this.renderHeaderCells(range)}
          </div>
        )}
        {this.getDateContentRow(groupedEvents, resource, id, range)}
      </div>
    ))
  }

  render() {
    let {
      width,
      rtl,
      scrollRef,
      isOverflowing,
      resourcesGroupBy,
      components: { timeGutterHeader: TimeGutterHeader },
    } = this.props

    let style = {}
    if (isOverflowing) {
      style[rtl ? 'marginLeft' : 'marginRight'] = `${scrollbarSize()}px`
    }

    return (
      <div
        style={style}
        ref={scrollRef}
        className={cn('rbc-time-header', isOverflowing && 'rbc-overflowing')}
      >
        <div
          className="rbc-label rbc-time-header-gutter"
          style={{ width, minWidth: width, maxWidth: width }}
        >
          {TimeGutterHeader && <TimeGutterHeader />}
        </div>

        {resourcesGroupBy === 'date' && this.renderGroupedByDate()}
        {resourcesGroupBy === 'resource' && this.renderGroupedByResource()}
      </div>
    )
  }
}

export default TimeGridHeader
