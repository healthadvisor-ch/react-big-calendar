'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')

exports.__esModule = true
exports.default = void 0

var _extends2 = _interopRequireDefault(
  require('@babel/runtime/helpers/extends')
)

var _inheritsLoose2 = _interopRequireDefault(
  require('@babel/runtime/helpers/inheritsLoose')
)

var _defaults3 = _interopRequireDefault(require('lodash/defaults'))

var _classnames = _interopRequireDefault(require('classnames'))

var _react = _interopRequireDefault(require('react'))

/* eslint-disable no-console */
function stringifyPercent(v) {
  return typeof v === 'string' ? v : v + '%'
}
/* eslint-disable react/prop-types */

var TimeGridEvent = /*#__PURE__*/ (function(_React$Component) {
  ;(0, _inheritsLoose2.default)(TimeGridEvent, _React$Component)

  function TimeGridEvent() {
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
    _this.state = {}
    return _this
  }

  var _proto = TimeGridEvent.prototype

  _proto.render = function render() {
    var _defaults2

    var _this$props = this.props,
      style = _this$props.style,
      className = _this$props.className,
      event = _this$props.event,
      accessors = _this$props.accessors,
      rtl = _this$props.rtl,
      selected = _this$props.selected,
      label = _this$props.label,
      continuesPrior = _this$props.continuesPrior,
      continuesAfter = _this$props.continuesAfter,
      getters = _this$props.getters,
      _onClick = _this$props.onClick,
      onDoubleClick = _this$props.onDoubleClick,
      resourceId = _this$props.resourceId,
      _this$props$component = _this$props.components,
      Event = _this$props$component.event,
      EventWrapper = _this$props$component.eventWrapper
    var title = accessors.title(event)
    var tooltip = accessors.tooltip(event)
    var end = accessors.end(event)
    var start = accessors.start(event)
    var icon = event.icon
    var userProps = getters.eventProp(event, start, end, selected, resourceId)
    var height = style.height,
      top = style.top,
      width = style.width,
      xOffset = style.xOffset
    var inner = [
      /*#__PURE__*/ _react.default.createElement(
        'div',
        {
          key: '1',
          className: 'rbc-event-label',
        },
        [
          icon &&
            /*#__PURE__*/ _react.default.createElement(
              'i',
              {
                className: 'material-icons',
                key: icon,
              },
              icon
            ),
          event.label || label,
        ]
      ),
      /*#__PURE__*/ _react.default.createElement(
        'div',
        {
          key: '2',
          className: 'rbc-event-content',
        },
        Event
          ? /*#__PURE__*/ _react.default.createElement(Event, {
              event: event,
              title: title,
            })
          : title
      ),
    ] // treat < 400 ms touches on events as clicks on touch devices
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

    return /*#__PURE__*/ _react.default.createElement(
      EventWrapper,
      (0, _extends2.default)(
        {
          type: 'time',
        },
        this.props
      ),
      /*#__PURE__*/ _react.default.createElement(
        'div',
        {
          onClick: function onClick(e) {
            _onClick(e) // const now = Date.now()
            // if (now - timestamp < 400) {
            //   onClick(e)
            // } else {
            //   e.stopPropagation()
            //   e.preventDefault()
            // }
            // this.setState({ timestamp: 0 })
          }, // onPointerDown={onTouchStart}
          // onPointerUp={onTouchEnd}
          onDoubleClick: onDoubleClick,
          style: (0, _defaults3.default)(
            {},
            userProps.style,
            ((_defaults2 = {
              top: stringifyPercent(top),
              height: stringifyPercent(height),
            }),
            (_defaults2[rtl ? 'right' : 'left'] = stringifyPercent(
              Math.max(0, xOffset)
            )),
            (_defaults2.width = stringifyPercent(width)),
            (_defaults2.maxWidth = userProps.style.left
              ? 'calc(100% - ' + userProps.style.left + ')'
              : '100%'),
            _defaults2)
          ),
          title: tooltip
            ? (typeof label === 'string' ? label + ': ' : '') + tooltip
            : undefined,
          className: (0, _classnames.default)(
            'rbc-event',
            className,
            userProps.className,
            {
              'rbc-selected': selected,
              'rbc-event-continues-earlier': continuesPrior,
              'rbc-event-continues-later': continuesAfter,
            }
          ),
        },
        inner
      )
    )
  }

  return TimeGridEvent
})(_react.default.Component)

var _default = TimeGridEvent
exports.default = _default
module.exports = exports.default
