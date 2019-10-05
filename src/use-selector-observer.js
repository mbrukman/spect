// selector-observer based impl
import { observe } from 'selector-observer'
import { fire } from './on-delegated'
import { html } from '.'

export default function use(selector, fn) {
  let resolve
  let p = new Promise(ok => { resolve = ok })

  let { abort } = observe(selector, {
    initialize(el) {
      fire(el, 'init', {selector})

      let props = {}
      for (let attr of el.attributes) {
        props[attr.name] = attr.value
      }

      let result = fn(el, props)

      // non-zero results are treated as mappers
      if (result !== undefined) {
        el.replaceWith(html`<>${result}</>`)
      }
      resolve(el)
      p = new Promise(ok => { resolve = ok })
      destroy.then = p.then.bind(p)
    },
    add(el) {
      fire(el, 'connected', {selector})
    },
    remove(el) {
      fire(el, 'disconnected', {selector})
    }
  })

  function destroy() { abort() }
  destroy.then = p.then.bind(p)
  return destroy
}
