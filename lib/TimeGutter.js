"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireWildcard(require("react"));

var _clsx = _interopRequireDefault(require("clsx"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _TimeSlots = require("./utils/TimeSlots");

var _TimeSlotGroup = _interopRequireDefault(require("./TimeSlotGroup"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * Since the TimeGutter only displays the 'times' of slots in a day, and is separate
 * from the Day Columns themselves, we check to see if the range contains an offset difference
 * and, if so, change the beginning and end 'date' by a day to properly display the slots times
 * used.
 */
function adjustForDST(_ref) {
  var min = _ref.min,
      max = _ref.max,
      localizer = _ref.localizer;

  if (localizer.getTimezoneOffset(min) !== localizer.getTimezoneOffset(max)) {
    return {
      start: localizer.add(min, -1, 'day'),
      end: localizer.add(max, -1, 'day')
    };
  }

  return {
    start: min,
    end: max
  };
}

var TimeGutter = function TimeGutter(_ref2) {
  var min = _ref2.min,
      max = _ref2.max,
      timeslots = _ref2.timeslots,
      step = _ref2.step,
      localizer = _ref2.localizer,
      getNow = _ref2.getNow,
      resource = _ref2.resource,
      components = _ref2.components,
      getters = _ref2.getters,
      gutterRef = _ref2.gutterRef;

  var _useMemo = (0, _react.useMemo)(function () {
    return adjustForDST({
      min: min,
      max: max,
      localizer: localizer
    });
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [min == null ? void 0 : min.toISOString(), max == null ? void 0 : max.toISOString(), localizer]),
      start = _useMemo.start,
      end = _useMemo.end;

  var _useState = (0, _react.useState)((0, _TimeSlots.getSlotMetrics)({
    min: start,
    max: end,
    timeslots: timeslots,
    step: step,
    localizer: localizer
  })),
      slotMetrics = _useState[0],
      setSlotMetrics = _useState[1];

  (0, _react.useEffect)(function () {
    if (slotMetrics) {
      setSlotMetrics(slotMetrics.update({
        min: start,
        max: end,
        timeslots: timeslots,
        step: step,
        localizer: localizer
      }));
    }
    /**
     * We don't want this to fire when slotMetrics is updated as it would recursively bomb
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [start == null ? void 0 : start.toISOString(), end == null ? void 0 : end.toISOString(), timeslots, step]);
  var renderSlot = (0, _react.useCallback)(function (value, idx) {
    if (idx) return null; // don't return the first (0) idx

    var isNow = slotMetrics.dateIsInGroup(getNow(), idx);
    return /*#__PURE__*/_react.default.createElement("span", {
      className: (0, _clsx.default)('rbc-label', isNow && 'rbc-now')
    }, localizer.format(value, 'timeGutterFormat'));
  }, [slotMetrics, localizer, getNow]);
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "rbc-time-gutter rbc-time-column",
    ref: gutterRef
  }, slotMetrics.groups.map(function (grp, idx) {
    return /*#__PURE__*/_react.default.createElement(_TimeSlotGroup.default, {
      key: idx,
      group: grp,
      resource: resource,
      components: components,
      renderSlot: renderSlot,
      getters: getters
    });
  }));
};

TimeGutter.propTypes = {
  min: _propTypes.default.instanceOf(Date).isRequired,
  max: _propTypes.default.instanceOf(Date).isRequired,
  timeslots: _propTypes.default.number.isRequired,
  step: _propTypes.default.number.isRequired,
  getNow: _propTypes.default.func.isRequired,
  components: _propTypes.default.object.isRequired,
  getters: _propTypes.default.object,
  localizer: _propTypes.default.object.isRequired,
  resource: _propTypes.default.string,
  gutterRef: _propTypes.default.any
};

var _default = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  return /*#__PURE__*/_react.default.createElement(TimeGutter, (0, _extends2.default)({
    gutterRef: ref
  }, props));
});

exports.default = _default;
module.exports = exports.default;