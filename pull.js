module.exports = function pull (stream) {
  stream = stream(module.exports.effects)

  const next = val => {
    const {done, value} = stream.next(val)
    if (!done) handle(value, next)
  }

  next()
}

const handle = (effect, cb) => {
  const {type, fn, args} = effect

  switch (type) {
    case 'put': return cb() // In case the final stream puts values
    case 'call': return cb(fn(...args))
    case 'cps':
      return fn(...args, (err, ..._args) => {
        if (err) thro(type, fn.name)(err)
        else cb(..._args)
      })
    case 'promise':
      return fn(...args)
        .then(response => cb(response))
        .catch(thro(type, fn.name))
    default: throw new Error(`Expected type of effect to be one of 'call, promise, or cps', got: ${type}`)
  }
}

const thro = (type, name) => err => {
  throw new Error(`Handling a ${type}, calling ${name} I got an error: ${err}`)
}

module.exports.effects = {
  put: value => ({type: 'put', value}),
  take: value => ({type: 'take', value}),
  call: (fn, ...args) => ({type: 'call', fn, args}),
  cps: (fn, ...args) => ({type: 'cps', fn, args}),
  promise: (fn, ...args) => ({type: 'promise', fn, args})
}
