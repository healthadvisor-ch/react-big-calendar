'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')

exports.__esModule = true
exports.default = void 0

var _extends2 = _interopRequireDefault(
  require('@babel/runtime/helpers/extends')
)

var _defaults3 = _interopRequireDefault(require('lodash/defaults'))

var _classnames = _interopRequireDefault(require('classnames'))

var _react = _interopRequireDefault(require('react'))

/* eslint-disable no-console */
function stringifyPercent(v) {
  return typeof v === 'string' ? v : v + '%'
}
/* eslint-disable react/prop-types */

function TimeGridEvent(props) {
  var _defaults2

  var style = props.style,
    className = props.className,
    event = props.event,
    accessors = props.accessors,
    rtl = props.rtl,
    selected = props.selected,
    label = props.label,
    continuesPrior = props.continuesPrior,
    continuesAfter = props.continuesAfter,
    getters = props.getters,
    _onClick = props.onClick,
    onDoubleClick = props.onDoubleClick,
    isBackgroundEvent = props.isBackgroundEvent,
    resourceId = props.resourceId,
    _props$components = props.components,
    Event = _props$components.event,
    EventWrapper = _props$components.eventWrapper
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

  var eventStyle = (0, _defaults3.default)(
    {},
    userProps.style,
    ((_defaults2 = {
      top: stringifyPercent(top),
      height: stringifyPercent(height),
    }),
    (_defaults2[rtl ? 'right' : 'left'] = stringifyPercent(
      Math.max(0, xOffset)
    )),
    (_defaults2.width = isBackgroundEvent
      ? 'calc(' + width + ' + 10px)'
      : stringifyPercent(width)),
    (_defaults2.maxWidth = userProps.style.left
      ? 'calc(100% - ' + userProps.style.left + ')'
      : '100%'),
    _defaults2)
  )
  return /*#__PURE__*/ _react.default.createElement(
    EventWrapper,
    (0, _extends2.default)(
      {
        type: 'time',
      },
      props
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
        style: eventStyle,
        title: tooltip
          ? (typeof label === 'string' ? label + ': ' : '') + tooltip
          : undefined,
        className: (0, _classnames.default)(
          isBackgroundEvent ? 'rbc-background-event' : 'rbc-event',
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

var _default = TimeGridEvent
exports.default = _default
module.exports = exports.default
