'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')

exports.__esModule = true
exports.default = void 0

var _inheritsLoose2 = _interopRequireDefault(
  require('@babel/runtime/helpers/inheritsLoose')
)

var _propTypes = _interopRequireDefault(require('prop-types'))

var _classnames = _interopRequireDefault(require('classnames'))

var _scrollbarSize = _interopRequireDefault(
  require('dom-helpers/util/scrollbarSize')
)

var _react = _interopRequireDefault(require('react'))

var _dates = _interopRequireDefault(require('./utils/dates'))

var _DateContentRow = _interopRequireDefault(require('./DateContentRow'))

var _Header = _interopRequireDefault(require('./Header'))

var _ResourceHeader = _interopRequireDefault(require('./ResourceHeader'))

var _eventLevels = require('./utils/eventLevels')

var _helpers = require('./utils/helpers')

var TimeGridHeader = /*#__PURE__*/ (function(_React$Component) {
  ;(0, _inheritsLoose2.default)(TimeGridHeader, _React$Component)

  function TimeGridHeader() {
    var _this

    for (
      var _len = arguments.length, args = new Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      args[_key] = arguments[_key]
    }

    _this =
      _React$Component.call.apply(_React$Component, [this].concat(args)) || this

    _this.handleHeaderClick = function(date, view, e) {
      e.preventDefault()
      ;(0, _helpers.notify)(_this.props.onDrillDown, [date, view])
    }

    _this.renderRow = function(resource) {
      var _this$props = _this.props,
        events = _this$props.events,
        rtl = _this$props.rtl,
        selectable = _this$props.selectable,
        getNow = _this$props.getNow,
        range = _this$props.range,
        getters = _this$props.getters,
        localizer = _this$props.localizer,
        accessors = _this$props.accessors,
        components = _this$props.components
      var resourceId = accessors.resourceId(resource)
      var eventsToDisplay = resource
        ? events.filter(function(event) {
            return accessors.resource(event) === resourceId
          })
        : events
      return /*#__PURE__*/ _react.default.createElement(
        _DateContentRow.default,
        {
          isAllDay: true,
          rtl: rtl,
          getNow: getNow,
          minRows: 2,
          range: range,
          events: eventsToDisplay,
          resourceId: resourceId,
          className: 'rbc-allday-cell',
          selectable: selectable,
          selected: _this.props.selected,
          components: components,
          accessors: accessors,
          getters: getters,
          localizer: localizer,
          onSelect: _this.props.onSelectEvent,
          onDoubleClick: _this.props.onDoubleClickEvent,
          onSelectSlot: _this.props.onSelectSlot,
          longPressThreshold: _this.props.longPressThreshold,
        }
      )
    }

    return _this
  }

  var _proto = TimeGridHeader.prototype

  _proto.renderHeaderCells = function renderHeaderCells(range) {
    var _this2 = this

    return range.map(function(date, i) {
      return _this2.renderHeaderSingleCell(date, i)
    })
  }

  _proto.renderHeaderSingleCell = function renderHeaderSingleCell(date, i) {
    var _this3 = this

    var _this$props2 = this.props,
      localizer = _this$props2.localizer,
      getDrilldownView = _this$props2.getDrilldownView,
      getNow = _this$props2.getNow,
      dayProp = _this$props2.getters.dayProp,
      _this$props2$componen = _this$props2.components.header,
      HeaderComponent =
        _this$props2$componen === void 0
          ? _Header.default
          : _this$props2$componen
    var today = getNow()
    var drilldownView = getDrilldownView(date)
    var label = localizer.format(date, 'dayFormat')

    var _dayProp = dayProp(date),
      className = _dayProp.className,
      style = _dayProp.style

    var header = /*#__PURE__*/ _react.default.createElement(HeaderComponent, {
      date: date,
      label: label,
      localizer: localizer,
    })

    return /*#__PURE__*/ _react.default.createElement(
      'div',
      {
        key: i,
        style: style,
        className: (0, _classnames.default)(
          'rbc-header',
          className,
          _dates.default.eq(date, today, 'day') && 'rbc-today'
        ),
      },
      drilldownView
        ? /*#__PURE__*/ _react.default.createElement(
            'a',
            {
              href: '#',
              onClick: function onClick(e) {
                return _this3.handleHeaderClick(date, drilldownView, e)
              },
            },
            header
          )
        : /*#__PURE__*/ _react.default.createElement('span', null, header)
    )
  }

  _proto.getDateContentRow = function getDateContentRow(
    groupedEvents,
    resource,
    resourceId,
    range
  ) {
    var _this$props3 = this.props,
      rtl = _this$props3.rtl,
      getNow = _this$props3.getNow,
      accessors = _this$props3.accessors,
      selectable = _this$props3.selectable,
      components = _this$props3.components,
      getters = _this$props3.getters,
      localizer = _this$props3.localizer
    return /*#__PURE__*/ _react.default.createElement(_DateContentRow.default, {
      isAllDay: true,
      rtl: rtl,
      getNow: getNow,
      minRows: 2,
      range: range,
      events: groupedEvents.get(resourceId) || [],
      resourceId: resource && resourceId,
      className: 'rbc-allday-cell',
      selectable: selectable,
      selected: this.props.selected,
      components: components,
      accessors: accessors,
      getters: getters,
      localizer: localizer,
      onSelect: this.props.onSelectEvent,
      onDoubleClick: this.props.onDoubleClickEvent,
      onSelectSlot: this.props.onSelectSlot,
      longPressThreshold: this.props.longPressThreshold,
    })
  }

  _proto.getEventsForDay = function getEventsForDay(events, date) {
    var _this$props4 = this.props,
      accessors = _this$props4.accessors,
      showMultiDayTimes = _this$props4.showMultiDayTimes
    var allDayEvents = []
    var end = new Date(date.getTime())
    end.setSeconds(end.getSeconds() + 23 * 2600 + 59 * 60 + 59)
    events.forEach(function(event) {
      if ((0, _eventLevels.inRange)(event, date, end, accessors)) {
        var eStart = accessors.start(event),
          eEnd = accessors.end(event)

        if (
          accessors.allDay(event) ||
          (_dates.default.isJustDate(eStart) && _dates.default.isJustDate(eEnd))
        ) {
          allDayEvents.push(event)
        }
      }
    })
    return allDayEvents
  }

  _proto.renderGroupedByDate = function renderGroupedByDate() {
    var _this4 = this

    var _this$props5 = this.props,
      accessors = _this$props5.accessors,
      events = _this$props5.events,
      range = _this$props5.range,
      resources = _this$props5.resources,
      _this$props5$componen = _this$props5.components.resourceHeader,
      ResourceHeaderComponent =
        _this$props5$componen === void 0
          ? _ResourceHeader.default
          : _this$props5$componen
    return range.map(function(date, rangeIndex) {
      return /*#__PURE__*/ _react.default.createElement(
        'div',
        {
          className: (0, _classnames.default)(
            'rbc-time-header-content',
            resources.length > 1 && 'rbc-time-header-content-last-in-resource'
          ),
          key: rangeIndex,
        },
        /*#__PURE__*/ _react.default.createElement(
          'div',
          {
            className: 'rbc-row rbc-time-header-cell',
          },
          _this4.renderHeaderSingleCell(date, rangeIndex)
        ),
        /*#__PURE__*/ _react.default.createElement(
          'div',
          {
            className: 'rbc-row rbc-row-resource',
          },
          resources.map(function(_ref, idx) {
            var id = _ref[0],
              resource = _ref[1]
            return /*#__PURE__*/ _react.default.createElement(
              'div',
              {
                className: 'rbc-header',
              },
              resource &&
                /*#__PURE__*/ _react.default.createElement(
                  ResourceHeaderComponent,
                  {
                    index: idx,
                    label: accessors.resourceTitle(resource),
                    resource: resource,
                  }
                ),
              _this4.getDateContentRow(
                resources.groupEvents(_this4.getEventsForDay(events, date)),
                resource,
                id,
                [date]
              )
            )
          })
        )
      )
    })
  }

  _proto.renderGroupedByResource = function renderGroupedByResource() {
    var _this5 = this

    var _this$props6 = this.props,
      accessors = _this$props6.accessors,
      events = _this$props6.events,
      range = _this$props6.range,
      resources = _this$props6.resources,
      _this$props6$componen = _this$props6.components.resourceHeader,
      ResourceHeaderComponent =
        _this$props6$componen === void 0
          ? _ResourceHeader.default
          : _this$props6$componen
    var groupedEvents = resources.groupEvents(events)
    return resources.map(function(_ref2, idx) {
      var id = _ref2[0],
        resource = _ref2[1]
      return /*#__PURE__*/ _react.default.createElement(
        'div',
        {
          className: 'rbc-time-header-content',
          key: id || idx,
        },
        resource &&
          /*#__PURE__*/ _react.default.createElement(
            'div',
            {
              className: 'rbc-row rbc-row-resource',
              key: 'resource_' + idx,
            },
            /*#__PURE__*/ _react.default.createElement(
              'div',
              {
                className: 'rbc-header',
              },
              /*#__PURE__*/ _react.default.createElement(
                ResourceHeaderComponent,
                {
                  index: idx,
                  label: accessors.resourceTitle(resource),
                  resource: resource,
                }
              )
            )
          ),
        range.length > 1 &&
          /*#__PURE__*/ _react.default.createElement(
            'div',
            {
              className: 'rbc-row rbc-time-header-cell',
            },
            _this5.renderHeaderCells(range)
          ),
        _this5.getDateContentRow(groupedEvents, resource, id, range)
      )
    })
  }

  _proto.render = function render() {
    var _this$props7 = this.props,
      width = _this$props7.width,
      rtl = _this$props7.rtl,
      scrollRef = _this$props7.scrollRef,
      isOverflowing = _this$props7.isOverflowing,
      resourcesGroupBy = _this$props7.resourcesGroupBy,
      TimeGutterHeader = _this$props7.components.timeGutterHeader
    var style = {}

    if (isOverflowing) {
      style[rtl ? 'marginLeft' : 'marginRight'] =
        (0, _scrollbarSize.default)() + 'px'
    }

    return /*#__PURE__*/ _react.default.createElement(
      'div',
      {
        style: style,
        ref: scrollRef,
        className: (0, _classnames.default)(
          'rbc-time-header',
          isOverflowing && 'rbc-overflowing'
        ),
      },
      /*#__PURE__*/ _react.default.createElement(
        'div',
        {
          className: 'rbc-label rbc-time-header-gutter',
          style: {
            width: width,
            minWidth: width,
            maxWidth: width,
          },
        },
        TimeGutterHeader &&
          /*#__PURE__*/ _react.default.createElement(TimeGutterHeader, null)
      ),
      resourcesGroupBy === 'date' && this.renderGroupedByDate(),
      resourcesGroupBy === 'resource' && this.renderGroupedByResource()
    )
  }

  return TimeGridHeader
})(_react.default.Component)

TimeGridHeader.propTypes = {
  range: _propTypes.default.array.isRequired,
  events: _propTypes.default.array.isRequired,
  resources: _propTypes.default.object,
  resourcesGroupBy: _propTypes.default.oneOf(['date', 'resource']).isRequired,
  getNow: _propTypes.default.func.isRequired,
  isOverflowing: _propTypes.default.bool,
  rtl: _propTypes.default.bool,
  width: _propTypes.default.number,
  localizer: _propTypes.default.object.isRequired,
  accessors: _propTypes.default.object.isRequired,
  components: _propTypes.default.object.isRequired,
  getters: _propTypes.default.object.isRequired,
  selected: _propTypes.default.object,
  selectable: _propTypes.default.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: _propTypes.default.number,
  onSelectSlot: _propTypes.default.func,
  onSelectEvent: _propTypes.default.func,
  onDoubleClickEvent: _propTypes.default.func,
  onDrillDown: _propTypes.default.func,
  getDrilldownView: _propTypes.default.func.isRequired,
  scrollRef: _propTypes.default.any,
}
var _default = TimeGridHeader
exports.default = _default
module.exports = exports.default
