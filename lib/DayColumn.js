'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')

exports.__esModule = true
exports.default = void 0

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(
  require('@babel/runtime/helpers/objectWithoutPropertiesLoose')
)

var _extends3 = _interopRequireDefault(
  require('@babel/runtime/helpers/extends')
)

var _assertThisInitialized2 = _interopRequireDefault(
  require('@babel/runtime/helpers/assertThisInitialized')
)

var _inheritsLoose2 = _interopRequireDefault(
  require('@babel/runtime/helpers/inheritsLoose')
)

var _propTypes = _interopRequireDefault(require('prop-types'))

var _react = _interopRequireWildcard(require('react'))

var _classnames = _interopRequireDefault(require('classnames'))

var _Selection = _interopRequireWildcard(require('./Selection'))

var _dates = _interopRequireDefault(require('./utils/dates'))

var TimeSlotUtils = _interopRequireWildcard(require('./utils/TimeSlots'))

var _selection = require('./utils/selection')

var _helpers = require('./utils/helpers')

var DayEventLayout = _interopRequireWildcard(require('./utils/DayEventLayout'))

var _DayColumnWrapper = _interopRequireDefault(require('./DayColumnWrapper'))

var _TimeSlotGroup = _interopRequireDefault(require('./TimeSlotGroup'))

var _TimeGridEvent = _interopRequireDefault(require('./TimeGridEvent'))

var _excluded = ['dayProp'],
  _excluded2 = ['eventContainerWrapper']

function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== 'function') return null
  var cacheBabelInterop = new WeakMap()
  var cacheNodeInterop = new WeakMap()
  return (_getRequireWildcardCache = function _getRequireWildcardCache(
    nodeInterop
  ) {
    return nodeInterop ? cacheNodeInterop : cacheBabelInterop
  })(nodeInterop)
}

function _interopRequireWildcard(obj, nodeInterop) {
  if (!nodeInterop && obj && obj.__esModule) {
    return obj
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return { default: obj }
  }
  var cache = _getRequireWildcardCache(nodeInterop)
  if (cache && cache.has(obj)) {
    return cache.get(obj)
  }
  var newObj = {}
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor
  for (var key in obj) {
    if (key !== 'default' && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc)
      } else {
        newObj[key] = obj[key]
      }
    }
  }
  newObj.default = obj
  if (cache) {
    cache.set(obj, newObj)
  }
  return newObj
}

var DayColumn = /*#__PURE__*/ (function(_React$Component) {
  ;(0, _inheritsLoose2.default)(DayColumn, _React$Component)

  function DayColumn() {
    var _this

    for (
      var _len = arguments.length, _args = new Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      _args[_key] = arguments[_key]
    }

    _this =
      _React$Component.call.apply(_React$Component, [this].concat(_args)) ||
      this
    _this.state = {
      selecting: false,
    }

    _this.renderEvents = function() {
      var _this$props = _this.props,
        events = _this$props.events,
        isRtl = _this$props.rtl,
        selected = _this$props.selected,
        accessors = _this$props.accessors,
        localizer = _this$props.localizer,
        getters = _this$props.getters,
        components = _this$props.components,
        step = _this$props.step,
        timeslots = _this$props.timeslots,
        resource = _this$props.resource

      var _assertThisInitialize = (0, _assertThisInitialized2.default)(_this),
        slotMetrics = _assertThisInitialize.slotMetrics

      var messages = localizer.messages
      var styledEvents = DayEventLayout.getStyledEvents({
        events: events,
        accessors: accessors,
        slotMetrics: slotMetrics,
        minimumStartDifference: Math.ceil((step * timeslots) / 2),
      })
      return styledEvents.map(function(_ref, idx) {
        var event = _ref.event,
          style = _ref.style
        var end = accessors.end(event)
        var start = accessors.start(event)
        var format = 'eventTimeRangeFormat'
        var label
        var startsBeforeDay = slotMetrics.startsBeforeDay(start)
        var startsAfterDay = slotMetrics.startsAfterDay(end)
        if (startsBeforeDay) format = 'eventTimeRangeEndFormat'
        else if (startsAfterDay) format = 'eventTimeRangeStartFormat'
        if (event.label) label = event.label
        else if (startsBeforeDay && startsAfterDay) label = messages.allDay
        else
          label = localizer.format(
            {
              start: start,
              end: end,
            },
            format
          )
        var continuesEarlier =
          startsBeforeDay || slotMetrics.startsBefore(start)
        var continuesLater = startsAfterDay || slotMetrics.startsAfter(end)
        return /*#__PURE__*/ _react.default.createElement(
          _TimeGridEvent.default,
          {
            style: style,
            event: event,
            label: label,
            key: 'evt_' + (resource ? resource + '_' : '') + idx,
            getters: getters,
            isRtl: isRtl,
            components: components,
            continuesEarlier: continuesEarlier,
            continuesLater: continuesLater,
            accessors: accessors,
            selected: (0, _selection.isSelected)(event, selected),
            resourceId: resource,
            onClick: function onClick(e) {
              return _this._select(event, e)
            },
            onDoubleClick: function onDoubleClick(e) {
              return _this._doubleClick(event, e)
            },
          }
        )
      })
    }

    _this._selectable = function() {
      var node = _this.containerRef.current
      var selector = (_this._selector = new _Selection.default(
        function() {
          return node
        },
        {
          longPressThreshold: _this.props.longPressThreshold,
        }
      ))

      var maybeSelect = function maybeSelect(box) {
        console.log('dc - maybe select')
        var onSelecting = _this.props.onSelecting
        var current = _this.state || {}
        var state = selectionState(box)
        var start = state.startDate,
          end = state.endDate

        if (onSelecting) {
          if (
            (_dates.default.eq(current.startDate, start, 'minutes') &&
              _dates.default.eq(current.endDate, end, 'minutes')) ||
            onSelecting({
              start: start,
              end: end,
            }) === false
          )
            return
        }

        if (
          _this.state.start !== state.start ||
          _this.state.end !== state.end ||
          _this.state.selecting !== state.selecting
        ) {
          _this.setState(state)
        }
      }

      var selectionState = function selectionState(point) {
        console.log('dc - selection state')

        var currentSlot = _this.slotMetrics.closestSlotFromPoint(
          point,
          (0, _Selection.getBoundsForNode)(node)
        )

        if (!_this.state.selecting) _this._initialSlot = currentSlot
        var initialSlot = _this._initialSlot
        if (initialSlot === currentSlot)
          currentSlot = _this.slotMetrics.nextSlot(initialSlot)

        var selectRange = _this.slotMetrics.getRange(
          _dates.default.min(initialSlot, currentSlot),
          _dates.default.max(initialSlot, currentSlot)
        )

        return (0, _extends3.default)({}, selectRange, {
          selecting: true,
          top: selectRange.top + '%',
          height: selectRange.height + '%',
        })
      }

      var selectorClicksHandler = function selectorClicksHandler(
        box,
        actionType
      ) {
        console.log('dc - click handler - ' + actionType)

        if (!(0, _Selection.isEvent)(_this.containerRef.current, box)) {
          var _selectionState = selectionState(box),
            startDate = _selectionState.startDate,
            endDate = _selectionState.endDate

          _this._selectSlot({
            startDate: startDate,
            endDate: endDate,
            action: actionType,
            box: box,
            allDay: false,
          })
        }

        _this.setState({
          selecting: false,
        })
      }

      selector.on('selecting', maybeSelect)
      selector.on('selectStart', maybeSelect)
      selector.on('beforeSelect', function(box) {
        console.log('dc - beforeselect, selectable: ' + _this.props.selectable)
        if (_this.props.selectable !== 'ignoreEvents') return
        var res = !(0, _Selection.isEvent)(_this.containerRef.current, box)
        console.log('dc - beforeselect result: ' + res)
        return res
      })
      selector.on('click', function(box) {
        return selectorClicksHandler(box, 'click')
      })
      selector.on('doubleClick', function(box) {
        return selectorClicksHandler(box, 'doubleClick')
      })
      selector.on('select', function(bounds) {
        console.log('dc - select selecting ' + _this.state.selecting)

        if (_this.state.selecting) {
          _this._selectSlot(
            (0, _extends3.default)({}, _this.state, {
              action: 'select',
              bounds: bounds,
            })
          )

          _this.setState({
            selecting: false,
          })
        }
      })
    }

    _this._teardownSelectable = function() {
      if (!_this._selector) return

      _this._selector.teardown()

      _this._selector = null
    }

    _this._selectSlot = function(_ref2) {
      var startDate = _ref2.startDate,
        endDate = _ref2.endDate,
        action = _ref2.action,
        bounds = _ref2.bounds,
        box = _ref2.box
      console.log('dc - selectslot!')
      var current = startDate,
        repeatLimit = (24 * 60) / _this.props.step,
        slots = []

      while (_dates.default.lte(current, endDate) && repeatLimit) {
        repeatLimit--
        slots.push(current)
        current = _dates.default.add(current, _this.props.step, 'minutes')
      }

      ;(0, _helpers.notify)(_this.props.onSelectSlot, {
        slots: slots,
        start: startDate,
        end: endDate,
        resourceId: _this.props.resource,
        action: action,
        bounds: bounds,
        box: box,
        allDay: false,
      })
    }

    _this._select = function() {
      console.log('dc - _select!')

      for (
        var _len2 = arguments.length, args = new Array(_len2), _key2 = 0;
        _key2 < _len2;
        _key2++
      ) {
        args[_key2] = arguments[_key2]
      }

      ;(0, _helpers.notify)(_this.props.onSelectEvent, args)
    }

    _this._doubleClick = function() {
      for (
        var _len3 = arguments.length, args = new Array(_len3), _key3 = 0;
        _key3 < _len3;
        _key3++
      ) {
        args[_key3] = arguments[_key3]
      }

      ;(0, _helpers.notify)(_this.props.onDoubleClickEvent, args)
    }

    _this.slotMetrics = TimeSlotUtils.getSlotMetrics(_this.props)
    _this.containerRef = /*#__PURE__*/ (0, _react.createRef)()
    return _this
  }

  var _proto = DayColumn.prototype

  _proto.componentDidMount = function componentDidMount() {
    this.props.selectable && this._selectable()
  }

  _proto.componentWillUnmount = function componentWillUnmount() {
    this._teardownSelectable()
  }

  _proto.UNSAFE_componentWillReceiveProps = function UNSAFE_componentWillReceiveProps(
    nextProps
  ) {
    if (nextProps.selectable && !this.props.selectable) this._selectable()
    if (!nextProps.selectable && this.props.selectable)
      this._teardownSelectable()
    this.slotMetrics = this.slotMetrics.update(nextProps)
  }

  _proto.render = function render() {
    var _this$props2 = this.props,
      date = _this$props2.date,
      max = _this$props2.max,
      rtl = _this$props2.rtl,
      isNow = _this$props2.isNow,
      resource = _this$props2.resource,
      accessors = _this$props2.accessors,
      localizer = _this$props2.localizer,
      _this$props2$getters = _this$props2.getters,
      dayProp = _this$props2$getters.dayProp,
      getters = (0, _objectWithoutPropertiesLoose2.default)(
        _this$props2$getters,
        _excluded
      ),
      _this$props2$componen = _this$props2.components,
      EventContainer = _this$props2$componen.eventContainerWrapper,
      components = (0, _objectWithoutPropertiesLoose2.default)(
        _this$props2$componen,
        _excluded2
      )
    var slotMetrics = this.slotMetrics
    var _this$state = this.state,
      selecting = _this$state.selecting,
      top = _this$state.top,
      height = _this$state.height,
      startDate = _this$state.startDate,
      endDate = _this$state.endDate
    var selectDates = {
      start: startDate,
      end: endDate,
    }

    var _dayProp = dayProp(max, resource),
      data = _dayProp.data,
      className = _dayProp.className,
      style = _dayProp.style

    var dataProps = Object.keys(data || {}).reduce(function(all, prop) {
      var _extends2

      return (0,
      _extends3.default)({}, all, ((_extends2 = {}), (_extends2['data-' + prop] = data[prop]), _extends2))
    }, {})
    var DayColumnWrapperComponent =
      components.dayColumnWrapper || _DayColumnWrapper.default
    return /*#__PURE__*/ _react.default.createElement(
      DayColumnWrapperComponent,
      (0, _extends3.default)(
        {
          ref: this.containerRef,
          date: date,
          style: style,
        },
        dataProps,
        {
          className: (0, _classnames.default)(
            className,
            this.props.className,
            'rbc-day-slot',
            'rbc-time-column',
            isNow && 'rbc-now',
            isNow && 'rbc-today', // WHY
            selecting && 'rbc-slot-selecting'
          ),
          slotMetrics: slotMetrics,
        }
      ),
      slotMetrics.groups.map(function(grp, idx) {
        return /*#__PURE__*/ _react.default.createElement(
          _TimeSlotGroup.default,
          {
            key: idx,
            group: grp,
            resource: resource,
            getters: getters,
            components: components,
          }
        )
      }),
      /*#__PURE__*/ _react.default.createElement(
        EventContainer,
        {
          localizer: localizer,
          resource: resource,
          accessors: accessors,
          getters: getters,
          components: components,
          slotMetrics: slotMetrics,
        },
        /*#__PURE__*/ _react.default.createElement(
          'div',
          {
            className: (0, _classnames.default)(
              'rbc-events-container',
              rtl && 'rtl'
            ),
          },
          this.renderEvents()
        )
      ),
      selecting &&
        /*#__PURE__*/ _react.default.createElement(
          'div',
          {
            className: 'rbc-slot-selection',
            style: {
              top: top,
              height: height,
            },
          },
          /*#__PURE__*/ _react.default.createElement(
            'span',
            null,
            localizer.format(selectDates, 'selectRangeFormat')
          )
        )
    )
  }

  return DayColumn
})(_react.default.Component)

DayColumn.propTypes = {
  events: _propTypes.default.array.isRequired,
  step: _propTypes.default.number.isRequired,
  date: _propTypes.default.instanceOf(Date).isRequired,
  min: _propTypes.default.instanceOf(Date).isRequired,
  max: _propTypes.default.instanceOf(Date).isRequired,
  getNow: _propTypes.default.func.isRequired,
  isNow: _propTypes.default.bool,
  rtl: _propTypes.default.bool,
  accessors: _propTypes.default.object.isRequired,
  components: _propTypes.default.object.isRequired,
  getters: _propTypes.default.object.isRequired,
  localizer: _propTypes.default.object.isRequired,
  showMultiDayTimes: _propTypes.default.bool,
  culture: _propTypes.default.string,
  timeslots: _propTypes.default.number,
  selected: _propTypes.default.object,
  selectable: _propTypes.default.oneOf([true, false, 'ignoreEvents']),
  eventOffset: _propTypes.default.number,
  longPressThreshold: _propTypes.default.number,
  onSelecting: _propTypes.default.func,
  onSelectSlot: _propTypes.default.func.isRequired,
  onSelectEvent: _propTypes.default.func.isRequired,
  onDoubleClickEvent: _propTypes.default.func.isRequired,
  className: _propTypes.default.string,
  dragThroughEvents: _propTypes.default.bool,
  resource: _propTypes.default.any,
}
DayColumn.defaultProps = {
  dragThroughEvents: true,
  timeslots: 2,
}
var _default = DayColumn
exports.default = _default
module.exports = exports.default
