import wickedElements from 'wicked-elements'
import { isIterable } from './util'

const cache = new Map

export default function use (selector, callback) {
  let observers = cache.get(selector)

  let resolve, queue = [new Promise(ok => resolve = ok)]

  let fn = el => {
    callback && callback(el)
    resolve({ value: el })
    let p = new Promise(ok => resolve = ok)
    handle.then = p.then.bind(p)
    queue.push(p)
  }

  let isFirst = false
  if (!observers) {
    isFirst = true
    cache.set(selector, observers = [fn])
  }
  else {
    observers.push(fn)
  }

  let handle = {
    end() {
      observers.splice(observers.indexOf(fn), 1)
      handle.done = true
    },
    [Symbol.asyncIterator]() {
      return {
        i: 0,
        next() {
          if (handle.done) return { done: true }
          this.i++
          let p = queue.shift()
          return p
        },
        return() {
          handle.end()
        }
      }
    },
    done: false,
    then: queue[0].then.bind(queue[0])
  }

  if (isFirst) {
    if (isIterable(selector)) {
      selector.forEach(el => wickedElements.define(el, { init(e) { Promise.resolve().then(() => init(el)) } }))
    }
    else {
      wickedElements.define(selector, {
        init(e) {
          init(e.currentTarget)
        }
      })
    }

    function init(el) {
      observers.forEach(fn => fn(el))
    }
  }

  return handle
}
