import { throttle } from 'lodash-es'

export function Throttle (milliseconds: number = 0, options = {}) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const map = new WeakMap()
    const originalMethod = descriptor.value
    descriptor.value = function (...params: (string | number)[]) {
      let throttled = map.get(this)
      if (!throttled) {
        throttled = throttle(originalMethod, milliseconds, options).bind(this)
        map.set(this, throttled)
      }
      throttled(...params)
    }
    return descriptor
  }
}
