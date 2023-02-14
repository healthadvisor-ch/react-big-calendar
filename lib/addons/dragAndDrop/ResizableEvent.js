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

var _propTypes = _interopRequireDefault(require('prop-types'))

var _react = _interopRequireDefault(require('react'))

var _reactDnd = require('react-dnd')

var _reactDndHtml5MixedBackend = require('@healthadvisor/react-dnd-html5-mixed-backend')

var _compose = _interopRequireDefault(require('./compose'))

var ResizableEvent = /*#__PURE__*/ (function(_React$Component) {
  ;(0, _inheritsLoose2.default)(ResizableEvent, _React$Component)

  function ResizableEvent() {
    return _React$Component.apply(this, arguments) || this
  }

  var _proto = ResizableEvent.prototype

  _proto.componentDidMount = function componentDidMount() {
    this.props.connectTopDragPreview(
      (0, _reactDndHtml5MixedBackend.getEmptyImage)(),
      {
        captureDraggingState: true,
      }
    )
    this.props.connectBottomDragPreview(
      (0, _reactDndHtml5MixedBackend.getEmptyImage)(),
      {
        captureDraggingState: true,
      }
    )
    this.props.connectLeftDragPreview(
      (0, _reactDndHtml5MixedBackend.getEmptyImage)(),
      {
        captureDraggingState: true,
      }
    )
    this.props.connectRightDragPreview(
      (0, _reactDndHtml5MixedBackend.getEmptyImage)(),
      {
        captureDraggingState: true,
      }
    )
  }

  _proto.render = function render() {
    var _this$props = this.props,
      title = _this$props.title,
      event = _this$props.event,
      connectTopDragSource = _this$props.connectTopDragSource,
      connectBottomDragSource = _this$props.connectBottomDragSource,
      connectLeftDragSource = _this$props.connectLeftDragSource,
      connectRightDragSource = _this$props.connectRightDragSource

    var _map = [connectTopDragSource, connectBottomDragSource].map(function(
        connectDragSource
      ) {
        return connectDragSource(
          /*#__PURE__*/ _react.default.createElement(
            'div',
            {
              className: 'rbc-addons-dnd-resize-anchor',
            },
            /*#__PURE__*/ _react.default.createElement('div', {
              className: 'rbc-addons-dnd-resize-icon',
            })
          )
        )
      }),
      Top = _map[0],
      Bottom = _map[1]

    var _map2 = [connectLeftDragSource, connectRightDragSource].map(function(
        connectDragSource
      ) {
        return connectDragSource(
          /*#__PURE__*/ _react.default.createElement(
            'div',
            {
              className: 'rbc-addons-dnd-resize-month-event-anchor',
            },
            ' '
          )
        )
      }),
      Left = _map2[0],
      Right = _map2[1]

    return event.allDay || this.props.isAllDay
      ? /*#__PURE__*/ _react.default.createElement(
          'div',
          {
            className: 'rbc-addons-dnd-resizable-month-event',
          },
          Left,
          title,
          Right
        )
      : /*#__PURE__*/ _react.default.createElement(
          'div',
          {
            className: 'rbc-addons-dnd-resizable-event',
          },
          Top,
          title,
          Bottom
        )
  }

  return ResizableEvent
})(_react.default.Component)

ResizableEvent.propTypes = {
  connectBottomDragPreview: _propTypes.default.func,
  connectBottomDragSource: _propTypes.default.func,
  connectLeftDragPreview: _propTypes.default.func,
  connectLeftDragSource: _propTypes.default.func,
  connectRightDragPreview: _propTypes.default.func,
  connectRightDragSource: _propTypes.default.func,
  connectTopDragPreview: _propTypes.default.func,
  connectTopDragSource: _propTypes.default.func,
  event: _propTypes.default.object,
  title: _propTypes.default.oneOfType([
    _propTypes.default.string,
    _propTypes.default.array,
  ]),
  isAllDay: _propTypes.default.bool,
}
var eventSourceTop = {
  beginDrag: function beginDrag(_ref) {
    var event = _ref.event
    window.resizeType = 'resizeTop'
    window.dateCell = null
    return (0, _extends2.default)({}, event, {
      type: 'resizeTop',
    })
  },
}
var eventSourceBottom = {
  beginDrag: function beginDrag(_ref2) {
    var event = _ref2.event
    window.resizeType = 'resizeBottom'
    window.dateCell = null
    return (0, _extends2.default)({}, event, {
      type: 'resizeBottom',
    })
  },
}
var eventSourceLeft = {
  beginDrag: function beginDrag(_ref3) {
    var event = _ref3.event
    return (0, _extends2.default)({}, event, {
      type: 'resizeLeft',
    })
  },
}
var eventSourceRight = {
  beginDrag: function beginDrag(_ref4) {
    var event = _ref4.event
    return (0, _extends2.default)({}, event, {
      type: 'resizeRight',
    })
  },
}

var _default = (0, _compose.default)(
  (0, _reactDnd.DragSource)('resize', eventSourceTop, function(connect) {
    return {
      connectTopDragPreview: connect.dragPreview(),
      connectTopDragSource: connect.dragSource(),
    }
  }),
  (0, _reactDnd.DragSource)('resize', eventSourceBottom, function(connect) {
    return {
      connectBottomDragSource: connect.dragSource(),
      connectBottomDragPreview: connect.dragPreview(),
    }
  }),
  (0, _reactDnd.DragSource)('resize', eventSourceLeft, function(connect) {
    return {
      connectLeftDragSource: connect.dragSource(),
      connectLeftDragPreview: connect.dragPreview(),
    }
  }),
  (0, _reactDnd.DragSource)('resize', eventSourceRight, function(connect) {
    return {
      connectRightDragSource: connect.dragSource(),
      connectRightDragPreview: connect.dragPreview(),
    }
  })
)(ResizableEvent)

exports.default = _default
module.exports = exports.default
