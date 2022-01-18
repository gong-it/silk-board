const subscriptions: { [eventType: string]: { [id: string]: Function} } = { }
const getNextUniqueId = getIdGenerator()

export interface ISubscription {
  unsubscribe: () => void
}

function subscribe (eventType: string, callback: Function): ISubscription {
  const id = getNextUniqueId()

  if (!subscriptions[eventType]) {
    subscriptions[eventType] = {}
  }

  subscriptions[eventType][id] = callback

  return {
    unsubscribe: () => {
      delete subscriptions[eventType][id]
      if (Object.keys(subscriptions[eventType]).length === 0) {
        delete subscriptions[eventType]
      }
    }
  }
}

function publish<T> (eventType: string, arg: T) {
  if (!subscriptions[eventType]) {
    return
  }

  Object.keys(subscriptions[eventType]).forEach((key: string) => subscriptions[eventType][key](arg))
}

function getIdGenerator () {
  let lastId = 0

  return function getNextUniqueId () {
    lastId += 1
    return lastId
  }
}

const EventBus = {
  publish,
  subscribe
}

export default EventBus
