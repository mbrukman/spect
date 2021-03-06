export default function fx(cb, deps=[Promise.resolve().then()]) {
  let current = [], prev = []
  let changed = false, destroy
  const notify = () => {
    if (changed) return
    changed = true
    Promise.resolve().then(() => {
      changed = false
      if (destroy && destroy.call) destroy(...prev)
      prev = [...current]
      destroy = cb(...current)
    })
  }

  // observe changes
  deps.map(async (dep, i) => {
    // resolve primitive immediately
    if (primitive(dep)) {
      current[i] = dep
      notify()
    }

    // async iterator
    else if (Symbol.asyncIterator in dep) {
      for await (let value of dep) {
        if (value === current[i]) continue
        current[i] = value
        notify()
      }
    }
    // promise
    else if ('then' in dep) {
      dep.then(value => {
        current[i] = value
        notify()
      })
    }
    // Observable
    else if ('subscribe' in dep) {
      dep.subscribe(value => {
        if (value === current[i]) return
        current[i] = value
        notify()
      })
    }
    // observable / observ / mutant
    else if (typeof dep === 'function') {
      dep(value => {
        if (value === current[i]) return
        current[i] = value
        notify()
      })
    }
  })
}

function primitive(val) {
  if (typeof val === 'object') {
    return val === null
  }
  return typeof val !== 'function'
}
