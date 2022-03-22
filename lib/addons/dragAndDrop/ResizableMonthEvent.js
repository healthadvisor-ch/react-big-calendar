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

var _reactDndHtml5MixedBackend = require('react-dnd-html5-mixed-backend')

var _compose = _interopRequireDefault(require('./compose'))

var ResizableMonthEvent = /*#__PURE__*/ (function(_React$Component) {
  ;(0, _inheritsLoose2.default)(ResizableMonthEvent, _React$Component)

  function ResizableMonthEvent() {
    return _React$Component.apply(this, arguments) || this
  }

  var _proto = ResizableMonthEvent.prototype

  _proto.componentDidMount = function componentDidMount() {
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
      connectLeftDragSource = _this$props.connectLeftDragSource,
      connectRightDragSource = _this$props.connectRightDragSource

    var _map = [connectLeftDragSource, connectRightDragSource].map(function(
        connectDragSource
      ) {
        return connectDragSource(
          _react.default.createElement(
            'div',
            {
              className: 'rbc-addons-dnd-resize-month-event-anchor',
            },
            ' '
          )
        )
      }),
      Left = _map[0],
      Right = _map[1]

    return _react.default.createElement(
      'div',
      {
        className: 'rbc-addons-dnd-resizable-month-event',
      },
      Left,
      title,
      Right
    )
  }

  return ResizableMonthEvent
})(_react.default.Component)

var eventSourceLeft = {
  beginDrag: function beginDrag(_ref) {
    var event = _ref.event
    return (0, _extends2.default)({}, event, {
      type: 'resizeLeft',
    })
  },
}
var eventSourceRight = {
  beginDrag: function beginDrag(_ref2) {
    var event = _ref2.event
    return (0, _extends2.default)({}, event, {
      type: 'resizeRight',
    })
  },
}
ResizableMonthEvent.propTypes = {
  connectLeftDragPreview: _propTypes.default.func,
  connectLeftDragSource: _propTypes.default.func,
  connectRightDragPreview: _propTypes.default.func,
  connectRightDragSource: _propTypes.default.func,
  title: _propTypes.default.oneOfType([
    _propTypes.default.string,
    _propTypes.default.array,
  ]),
}

var _default = (0, _compose.default)(
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
)(ResizableMonthEvent)

exports.default = _default
module.exports = exports['default']
