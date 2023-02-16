import PropTypes from 'prop-types'
import cn from 'classnames'
import * as animationFrame from 'dom-helpers/animationFrame'
import React, { Component } from 'react'

import DayColumn from './DayColumn'
import TimeGutter from './TimeGutter'

import getWidth from 'dom-helpers/width'
import TimeGridHeader from './TimeGridHeader'
import { notify } from './utils/helpers'
import { inRange, sortEvents } from './utils/eventLevels'
import Resources from './utils/Resources'
import { DayLayoutAlgorithmPropType } from './utils/propTypes'

export default class TimeGrid extends Component {
  static propTypes = {
    events: PropTypes.array.isRequired,
    resources: PropTypes.array,
    resourcesGroupBy: PropTypes.oneOf(['date', 'resource']).isRequired,

    step: PropTypes.number,
    timeslots: PropTypes.number,
    range: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
    min: PropTypes.instanceOf(Date).isRequired,
    max: PropTypes.instanceOf(Date).isRequired,
    getNow: PropTypes.func.isRequired,

    scrollToTime: PropTypes.instanceOf(Date).isRequired,
    showMultiDayTimes: PropTypes.bool,

    rtl: PropTypes.bool,
    resizable: PropTypes.bool,
    width: PropTypes.number,

    accessors: PropTypes.object.isRequired,
    components: PropTypes.object.isRequired,
    getters: PropTypes.object.isRequired,
    localizer: PropTypes.object.isRequired,

    selected: PropTypes.object,
    selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
    longPressThreshold: PropTypes.number,

    onNavigate: PropTypes.func,
    onSelectSlot: PropTypes.func,
    onSelectEnd: PropTypes.func,
    onSelectStart: PropTypes.func,
    onSelectEvent: PropTypes.func,
    onDoubleClickEvent: PropTypes.func,
    onDrillDown: PropTypes.func,
    getDrilldownView: PropTypes.func.isRequired,
    useDynamicWidthOfTimeIndicator: PropTypes.bool,

    dayLayoutAlgorithm: DayLayoutAlgorithmPropType,
  }

  static defaultProps = {
    step: 30,
    timeslots: 2,
    useDynamicWidthOfTimeIndicator: false,
  }

  constructor(props) {
    super(props)

    this.state = { gutterWidth: undefined, isOverflowing: null }

    this.scrollRef = React.createRef()
    this.contentRef = React.createRef()
    this._scrollRatio = null
    this.gutterRef = React.createRef()
    this.timeIndicatorRef = React.createRef()
  }

  UNSAFE_componentWillMount() {
    this.calculateScroll()
  }

  componentDidMount() {
    this.checkOverflow()

    if (this.props.width == null) {
      this.measureGutter()
    }

    this.applyScroll()

    setTimeout(() => {
      this.positionTimeIndicator()
    }, 100)
    this.triggerTimeIndicatorUpdate()

    window.addEventListener('resize', this.handleResize)
  }

  positionTimeIndicator() {
    const {
      rtl,
      min,
      max,
      getNow,
      localizer,
      useDynamicWidthOfTimeIndicator,
    } = this.props
    const current = getNow()

    const secondsGrid = localizer.diff(max, min, 'seconds')
    const secondsPassed = localizer.diff(current, min, 'seconds')

    const timeIndicator = this.timeIndicatorRef.current
    const factor = secondsPassed / secondsGrid
    const timeGutter = this.gutterRef?.current

    if (timeGutter && current >= min && current <= max) {
      if (useDynamicWidthOfTimeIndicator) {
        // reset width in order to proper calculation when timeGrid is smaller than before the change
        timeIndicator.style.width = `calc(100% - ${timeGutter.parentElement.scrollWidth}px)`
      }

      const pixelHeight = timeGutter.offsetHeight
      const offset = Math.floor(factor * pixelHeight)

      timeIndicator.style.display = 'block'
      if (useDynamicWidthOfTimeIndicator) {
        timeIndicator.style.width =
          timeGutter.parentElement.scrollWidth - timeGutter.offsetWidth + 'px'
      } else {
        timeIndicator.style[rtl ? 'left' : 'right'] = 0
      }
      timeIndicator.style[rtl ? 'right' : 'left'] =
        timeGutter.offsetWidth + 'px'
      timeIndicator.style.top = offset + 'px'
    } else {
      timeIndicator.style.display = 'none'
    }
  }

  triggerTimeIndicatorUpdate() {
    // Update the position of the time indicator every minute
    this._timeIndicatorTimeout = window.setTimeout(() => {
      this.positionTimeIndicator()
      this.triggerTimeIndicatorUpdate()
    }, 60000)
  }

  handleScroll = e => {
    if (this.scrollRef.current) {
      this.scrollRef.current.scrollLeft = e.target.scrollLeft
    }
  }

  handleResize = () => {
    animationFrame.cancel(this.rafHandle)
    this.rafHandle = animationFrame.request(this.checkOverflow)
    this.positionTimeIndicator()
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
    window.clearTimeout(this._timeIndicatorTimeout)

    animationFrame.cancel(this.rafHandle)

    if (this.measureGutterAnimationFrameRequest) {
      window.cancelAnimationFrame(this.measureGutterAnimationFrameRequest)
    }
  }

  componentDidUpdate() {
    if (this.props.width == null) {
      this.measureGutter()
    }

    this.applyScroll()
    setTimeout(() => {
      this.positionTimeIndicator()
    }, 1000)
    //this.checkOverflow()
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { range, scrollToTime, localizer } = this.props
    // When paginating, reset scroll
    if (
      localizer.neq(nextProps.range[0], range[0], 'minutes') ||
      localizer.neq(nextProps.scrollToTime, scrollToTime, 'minutes')
    ) {
      this.calculateScroll(nextProps)
    }
  }

  handleSelectAlldayEvent = (...args) => {
    //cancel any pending selections so only the event click goes through.
    this.clearSelection()
    notify(this.props.onSelectEvent, args)
  }

  handleSelectAllDaySlot = (slots, slotInfo) => {
    const { onSelectSlot } = this.props

    const start = new Date(slots[0])
    const end = new Date(slots[slots.length - 1])
    end.setDate(slots[slots.length - 1].getDate() + 1)

    notify(onSelectSlot, {
      slots,
      start,
      end,
      action: slotInfo.action,
      allDay: true,
    })
  }

  renderDayColumn(
    events,
    date,
    dateIndex,
    allResources,
    resource,
    resourceId,
    resourceIndex,
    now
  ) {
    let {
      min,
      max,
      components,
      accessors,
      localizer,
      resourcesGroupBy,
      dayLayoutAlgorithm,
    } = this.props
    const groupedEvents = allResources.groupEvents(events)

    const daysEvents = (groupedEvents.get(resourceId) || []).filter(event =>
      localizer.inRange(
        date,
        accessors.start(event),
        accessors.end(event),
        'day'
      )
    )

    return (
      <DayColumn
        {...this.props}
        localizer={localizer}
        min={localizer.merge(date, min)}
        max={localizer.merge(date, max)}
        resource={resource && resourceId}
        components={components}
        isNow={localizer.isSameDate(date, now)}
        key={resourceIndex + '-' + dateIndex}
        date={date}
        events={daysEvents}
        className={
          resourceIndex === allResources.length - 1 &&
          resourcesGroupBy === 'date'
            ? 'rbc-time-column-last-in-resource'
            : undefined
        }
        dayLayoutAlgorithm={dayLayoutAlgorithm}
      />
    )
  }

  renderEvents(range, events, now, allResources) {
    if (this.props.resourcesGroupBy === 'date') {
      return range.map((date, dateIndex) =>
        allResources.map(([resourceId, resource], resourceIndex) =>
          this.renderDayColumn(
            events,
            date,
            dateIndex,
            allResources,
            resource,
            resourceId,
            resourceIndex,
            now
          )
        )
      )
    }

    return allResources.map(([resourceId, resource], resourceIndex) =>
      range.map((date, dateIndex) =>
        this.renderDayColumn(
          events,
          date,
          dateIndex,
          allResources,
          resource,
          resourceId,
          resourceIndex,
          now
        )
      )
    )
  }

  render() {
    let {
      events,
      range,
      width,
      rtl,
      selected,
      getNow,
      resources,
      components,
      accessors,
      getters,
      localizer,
      min,
      max,
      showMultiDayTimes,
      longPressThreshold,
      resourcesGroupBy,
      resizable,
    } = this.props

    let _resources = Resources(resources, accessors)

    width = width || this.state.gutterWidth

    let start = range[0],
      end = range[range.length - 1]

    this.slots = range.length

    let allDayEvents = [],
      rangeEvents = []

    events.forEach(event => {
      if (inRange(event, start, end, accessors, localizer)) {
        let eStart = accessors.start(event),
          eEnd = accessors.end(event)

        if (
          accessors.allDay(event) ||
          localizer.startAndEndAreDateOnly(eStart, eEnd) ||
          (!showMultiDayTimes && !localizer.isSameDate(eStart, eEnd))
        ) {
          allDayEvents.push(event)
        } else {
          rangeEvents.push(event)
        }
      }
    })

    allDayEvents.sort((a, b) => sortEvents(a, b, accessors, localizer))

    // don't render time label for single DAY view
    // TODO
    // const renderHeaderRow = range.length !== 1

    return (
      <div
        className={cn('rbc-time-view', resources && 'rbc-time-view-resources')}
      >
        <TimeGridHeader
          range={range}
          events={allDayEvents}
          width={width}
          rtl={rtl}
          getNow={getNow}
          localizer={localizer}
          selected={selected}
          resources={_resources}
          resourcesGroupBy={resourcesGroupBy}
          selectable={this.props.selectable}
          accessors={accessors}
          getters={getters}
          components={components}
          scrollRef={this.scrollRef}
          isOverflowing={this.state.isOverflowing}
          longPressThreshold={longPressThreshold}
          onSelectSlot={this.handleSelectAllDaySlot}
          onSelectEvent={this.handleSelectAlldayEvent}
          onDoubleClickEvent={this.props.onDoubleClickEvent}
          onDrillDown={this.props.onDrillDown}
          getDrilldownView={this.props.getDrilldownView}
          resizable={resizable}
        />
        <div
          ref={this.contentRef}
          className="rbc-time-content"
          onScroll={this.handleScroll}
        >
          <TimeGutter
            date={start}
            ref={this.gutterRef}
            localizer={localizer}
            min={localizer.merge(start, min)}
            max={localizer.merge(start, max)}
            step={this.props.step}
            getNow={this.props.getNow}
            timeslots={this.props.timeslots}
            components={components}
            className="rbc-time-gutter"
            getters={getters}
          />
          {this.renderEvents(range, rangeEvents, getNow(), _resources)}
          <div
            ref={this.timeIndicatorRef}
            className="rbc-current-time-indicator"
          />
        </div>
      </div>
    )
  }

  clearSelection() {
    clearTimeout(this._selectTimer)
    this._pendingSelection = []
  }

  measureGutter() {
    if (this.measureGutterAnimationFrameRequest) {
      window.cancelAnimationFrame(this.measureGutterAnimationFrameRequest)
    }
    this.measureGutterAnimationFrameRequest = window.requestAnimationFrame(
      () => {
        const width = getWidth(this.gutterRef?.current)

        if (width && this.state.gutterWidth !== width) {
          this.setState({ gutterWidth: width })
        }
      }
    )
  }

  applyScroll() {
    if (this._scrollRatio) {
      const content = this.contentRef.current
      content.scrollTop = content.scrollHeight * this._scrollRatio
      // Only do this once
      this._scrollRatio = null
    }
  }

  calculateScroll(props = this.props) {
    const { min, max, scrollToTime, localizer } = props

    const diffMillis = scrollToTime - localizer.startOf(scrollToTime, 'day')
    const totalMillis = localizer.diff(min, max, 'milliseconds')

    this._scrollRatio = diffMillis / totalMillis
  }

  checkOverflow = () => {
    if (this._updatingOverflow) return

    let isOverflowing = true // because scrollbar will be always visible
    //       this.refs.content.scrollHeight > this.refs.content.clientHeight

    if (this.state.isOverflowing !== isOverflowing) {
      this._updatingOverflow = true
      this.setState({ isOverflowing }, () => {
        this._updatingOverflow = false
      })
    }
  }
}
