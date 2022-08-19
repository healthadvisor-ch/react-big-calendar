'use strict'

exports.__esModule = true
exports.NONE = void 0
exports.default = Resources
var NONE = {}
exports.NONE = NONE

function Resources(resources, accessors) {
  function getLength() {
    if (!resources) return 0
    return resources.length
  }

  return {
    map: function map(fn) {
      if (!resources) return [fn([NONE, null], 0)]
      return resources.map(function(resource, idx) {
        return fn([accessors.resourceId(resource), resource], idx)
      })
    },
    groupEvents: function groupEvents(events) {
      var eventsByResource = new window.Map()
      events.forEach(function(event) {
        var idOrIds = accessors.resource(event) || NONE
        var ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds]
        ids.forEach(function(id) {
          var resourceEvents = eventsByResource.get(id) || []
          resourceEvents.push(event)
          eventsByResource.set(id, resourceEvents)
        })
      })
      return eventsByResource
    },
    length: getLength(),
  }
}
