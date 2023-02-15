'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')

exports.__esModule = true
exports.default = void 0

var _extends2 = _interopRequireDefault(
  require('@babel/runtime/helpers/extends')
)

var _react = _interopRequireDefault(require('react'))

var _propTypes = _interopRequireDefault(require('prop-types'))

var DayColumnWrapper = function DayColumnWrapper(_ref) {
  var children = _ref.children,
    className = _ref.className,
    style = _ref.style,
    dataProps = _ref.dataProps,
    innerRef = _ref.innerRef
  return /*#__PURE__*/ _react.default.createElement(
    'div',
    (0, _extends2.default)({}, dataProps, {
      className: className,
      style: style,
      ref: innerRef,
    }),
    children
  )
}

DayColumnWrapper.propTypes = {
  dataProps: _propTypes.default.shape({}),
  innerRef: _propTypes.default.shape({}),
}

var _default = /*#__PURE__*/ _react.default.forwardRef(function(props, ref) {
  return /*#__PURE__*/ _react.default.createElement(
    DayColumnWrapper,
    (0, _extends2.default)({}, props, {
      innerRef: ref,
    })
  )
})

exports.default = _default
module.exports = exports.default
