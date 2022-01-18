import { debounce } from 'lodash-es'

export function Debounce (milliseconds: number = 0, options = {}) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const map = new WeakMap()
    const originalMethod = descriptor.value
    descriptor.value = function (...params: (string | number)[]) {
      let debounced = map.get(this)
      if (!debounced) {
        debounced = debounce(originalMethod, milliseconds, options).bind(this)
        map.set(this, debounced)
      }
      debounced(...params)
    }
    return descriptor
  }
}
