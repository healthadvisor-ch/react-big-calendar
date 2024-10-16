"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.endOfRange = endOfRange;
exports.eventLevels = eventLevels;
exports.eventSegments = eventSegments;
exports.inRange = inRange;
exports.segsOverlap = segsOverlap;
exports.sortEvents = sortEvents;

var _findIndex = _interopRequireDefault(require("lodash/findIndex"));

var _dates = require("./dates");

function endOfRange(_ref) {
  var dateRange = _ref.dateRange,
      _ref$unit = _ref.unit,
      unit = _ref$unit === void 0 ? 'day' : _ref$unit,
      localizer = _ref.localizer;
  return {
    first: dateRange[0],
    last: localizer.add(dateRange[dateRange.length - 1], 1, unit)
  };
} // properly calculating segments requires working with dates in
// the timezone we're working with, so we use the localizer


function eventSegments(event, range, accessors, localizer) {
  var _endOfRange = endOfRange({
    dateRange: range,
    localizer: localizer
  }),
      first = _endOfRange.first,
      last = _endOfRange.last;

  var slots = localizer.diff(first, last, 'day');
  var start = localizer.max(localizer.startOf(accessors.start(event), 'day'), first);
  var end = localizer.min(localizer.ceil(accessors.end(event), 'day'), last);
  var padding = (0, _findIndex.default)(range, function (x) {
    return localizer.eq(x, start, 'day');
  });
  var span = localizer.diff(start, end, 'day');
  span = Math.min(span, slots); // The segmentOffset is necessary when adjusting for timezones
  // ahead of the browser timezone

  span = Math.max(span - localizer.segmentOffset, 1);
  return {
    event: event,
    span: span,
    left: padding + 1,
    right: Math.max(padding + span, 1)
  };
}

function eventLevels(rowSegments, limit) {
  if (limit === void 0) {
    limit = Infinity;
  }

  var i,
      j,
      seg,
      levels = [],
      extra = [];

  for (i = 0; i < rowSegments.length; i++) {
    seg = rowSegments[i];

    for (j = 0; j < levels.length; j++) {
      if (!segsOverlap(seg, levels[j])) break;
    }

    if (j >= limit) {
      extra.push(seg);
    } else {
      ;
      (levels[j] || (levels[j] = [])).push(seg);
    }
  }

  for (i = 0; i < levels.length; i++) {
    levels[i].sort(function (a, b) {
      return a.left - b.left;
    }); //eslint-disable-line
  }

  return {
    levels: levels,
    extra: extra
  };
}

function inRange(e, start, end, accessors) {
  var eStart = (0, _dates.startOf)(accessors.start(e), 'day');
  var eEnd = accessors.end(e);
  return start.getTime() <= eStart.getTime() && end.getTime() >= eStart.getTime() || start.getTime() <= eEnd.getTime() && end.getTime() >= eEnd.getTime();
}

function segsOverlap(seg, otherSegs) {
  return otherSegs.some(function (otherSeg) {
    return otherSeg.left <= seg.right && otherSeg.right >= seg.left;
  });
}

function sortEvents(evtA, evtB, accessors) {
  var startSort = +(0, _dates.startOf)(accessors.start(evtA), 'day') - +(0, _dates.startOf)(accessors.start(evtB), 'day');
  var durA = (0, _dates.diff)(accessors.start(evtA), (0, _dates.ceil)(accessors.end(evtA), 'day'), 'day');
  var durB = (0, _dates.diff)(accessors.start(evtB), (0, _dates.ceil)(accessors.end(evtB), 'day'), 'day');
  return startSort || // sort by start Day first
  Math.max(durB, 1) - Math.max(durA, 1) || // events spanning multiple days go first
  !!accessors.allDay(evtB) - !!accessors.allDay(evtA) || // then allDay single day events
  +accessors.start(evtA) - +accessors.start(evtB) || // then sort by start time
  +accessors.end(evtA) - +accessors.end(evtB) // then sort by end time
  ;
}