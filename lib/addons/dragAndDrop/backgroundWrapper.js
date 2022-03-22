'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')

exports.__esModule = true
exports.getEventTimes = getEventTimes
exports.DayWrapper = exports.DateCellWrapper = void 0

var _extends2 = _interopRequireDefault(
  require('@babel/runtime/helpers/extends')
)

var _inheritsLoose2 = _interopRequireDefault(
  require('@babel/runtime/helpers/inheritsLoose')
)

var _propTypes = _interopRequireDefault(require('prop-types'))

var _react = _interopRequireDefault(require('react'))

var _reactDnd = require('react-dnd')

var _classnames = _interopRequireDefault(require('classnames'))

var _propTypes2 = require('../../utils/propTypes')

var _accessors = require('../../utils/accessors')

var _dates = _interopRequireDefault(require('../../utils/dates'))

var _index = _interopRequireDefault(require('../../index'))

function getEventTimes(start, end, dropDate, type) {
  // Calculate duration between original start and end dates
  var duration = _dates.default.diff(start, end) // If the event is dropped in a "Day" cell, preserve an event's start time by extracting the hours and minutes off
  // the original start date and add it to newDate.value

  var nextStart =
    type === 'dateCellWrapper'
      ? _dates.default.merge(dropDate, start)
      : dropDate

  if (type === 'dayWrapper' && window.updateDropPositionBasedOnDragPoint) {
    var _window$updateDropPos = window.updateDropPositionBasedOnDragPoint,
      dragPointDistanceFromTop = _window$updateDropPos.dragPointDistanceFromTop,
      draggedElementHeight = _window$updateDropPos.draggedElementHeight

    if ((dragPointDistanceFromTop, draggedElementHeight)) {
      var diff = parseInt(
        (dragPointDistanceFromTop * duration) / draggedElementHeight,
        10
      ) // Round to given step duration (15 minutes by default)

      var minStepDuration = (window.minStepDuration || 15) * 60 * 1000
      diff = Math.floor(diff / minStepDuration) * minStepDuration
      nextStart = _dates.default.subtract(nextStart, diff, 'milliseconds')
    }

    delete window.updateDropPositionBasedOnDragPoint
  }

  var nextEnd = _dates.default.add(nextStart, duration, 'milliseconds')

  return {
    start: nextStart,
    end: nextEnd,
  }
}

var propTypes = {
  connectDropTarget: _propTypes.default.func.isRequired,
  type: _propTypes.default.string,
  isOver: _propTypes.default.bool,
}

var DraggableBackgroundWrapper = /*#__PURE__*/ (function(_React$Component) {
  ;(0, _inheritsLoose2.default)(DraggableBackgroundWrapper, _React$Component)

  function DraggableBackgroundWrapper() {
    return _React$Component.apply(this, arguments) || this
  }

  var _proto = DraggableBackgroundWrapper.prototype

  // constructor(...args) {
  //   super(...args);
  //   this.state = { isOver: false };
  // }
  //
  // UNSAFE_componentWillMount() {
  //   let monitor = this.context.dragDropManager.getMonitor()
  //
  //   this.monitor = monitor
  //
  //   this.unsubscribeToStateChange = monitor
  //     .subscribeToStateChange(this.handleStateChange)
  //
  //   this.unsubscribeToOffsetChange = monitor
  //     .subscribeToOffsetChange(this.handleOffsetChange)
  // }
  //
  // componentWillUnmount() {
  //   this.monitor = null
  //   this.unsubscribeToStateChange()
  //   this.unsubscribeToOffsetChange()
  // }
  //
  // handleStateChange = () => {
  //   const event = this.monitor.getItem();
  //   if (!event && this.state.isOver) {
  //     this.setState({ isOver: false });
  //   }
  // }
  //
  // handleOffsetChange = () => {
  //   const { value } = this.props;
  //   const { start, end } = this.monitor.getItem();
  //
  //   const isOver = dates.inRange(value, start, end, 'minute');
  //   if (this.state.isOver !== isOver) {
  //     this.setState({ isOver });
  //   }
  // };
  _proto.render = function render() {
    var _this$props = this.props,
      connectDropTarget = _this$props.connectDropTarget,
      children = _this$props.children,
      type = _this$props.type,
      isOver = _this$props.isOver
    var BackgroundWrapper = _index.default.components[type]
    var resultingChildren = children
    if (isOver)
      resultingChildren = _react.default.cloneElement(children, {
        className: (0, _classnames.default)(
          children.props.className,
          'rbc-addons-dnd-over'
        ),
      })
    return _react.default.createElement(
      BackgroundWrapper,
      null,
      connectDropTarget(resultingChildren)
    )
  }

  return DraggableBackgroundWrapper
})(_react.default.Component)

DraggableBackgroundWrapper.propTypes = propTypes
DraggableBackgroundWrapper.contextTypes = {
  onEventDrop: _propTypes.default.func,
  onEventResize: _propTypes.default.func,
  dragDropManager: _propTypes.default.object,
  startAccessor: _propTypes2.accessor,
  endAccessor: _propTypes2.accessor,
}

function createWrapper(type) {
  function collectTarget(connect, monitor) {
    return {
      type: type,
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver(),
    }
  }

  var dropTarget = {
    drop: function drop(_, monitor, _ref) {
      var props = _ref.props,
        context = _ref.context
      window.resizeType = null
      window.over = null

      if (window.meetingDuration) {
        window.meetingDuration.innerHTML = ''
        window.meetingDuration.style.display = 'none'
      }

      var event = monitor.getItem()
      var value = props.value
      var onEventDrop = context.onEventDrop,
        onEventResize = context.onEventResize,
        startAccessor = context.startAccessor,
        endAccessor = context.endAccessor
      var start = (0, _accessors.accessor)(event, startAccessor)
      var end = (0, _accessors.accessor)(event, endAccessor)

      if (monitor.getItemType() === 'event') {
        onEventDrop(
          (0, _extends2.default)(
            {
              event: event,
            },
            getEventTimes(start, end, value, type)
          )
        )
      }

      if (monitor.getItemType() === 'resize') {
        switch (event.type) {
          case 'resizeTop': {
            return onEventResize('drop', {
              event: event,
              start: value,
              end: event.end,
            })
          }

          case 'resizeBottom': {
            return onEventResize('drop', {
              event: event,
              start: event.start,
              end: value,
            })
          }

          case 'resizeLeft': {
            return onEventResize('drop', {
              event: event,
              start: value,
              end: event.end,
            })
          }

          case 'resizeRight': {
            var nextEnd = _dates.default.add(value, 1, 'day')

            return onEventResize('drop', {
              event: event,
              start: event.start,
              end: nextEnd,
            })
          }
        } // Catch all

        onEventResize('drop', {
          event: event,
          start: event.start,
          end: value,
        })
      }
    },
  }
  return (0, _reactDnd.DropTarget)(
    ['event', 'resize'],
    dropTarget,
    collectTarget
  )(DraggableBackgroundWrapper)
}

var DateCellWrapper = createWrapper('dateCellWrapper')
exports.DateCellWrapper = DateCellWrapper
var DayWrapper = createWrapper('dayWrapper')
exports.DayWrapper = DayWrapper
