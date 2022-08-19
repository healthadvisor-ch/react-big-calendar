export const NONE = {}

export default function Resources(resources, accessors) {
  function getLength() {
    if (!resources) return 0

    return resources.length
  }

  return {
    map(fn) {
      if (!resources) return [fn([NONE, null], 0)]
      return resources.map((resource, idx) =>
        fn([accessors.resourceId(resource), resource], idx)
      )
    },

    groupEvents(events) {
      const eventsByResource = new window.Map()
      events.forEach(event => {
        const idOrIds = accessors.resource(event) || NONE
        const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds]
        ids.forEach(id => {
          let resourceEvents = eventsByResource.get(id) || []
          resourceEvents.push(event)
          eventsByResource.set(id, resourceEvents)
        })
      })
      return eventsByResource
    },
    length: getLength(),
  }
}
