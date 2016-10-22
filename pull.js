module.exports = function pull (stream) {
  stream = stream({
    put: value => ({type: 'put', value}),
    call: (fn, ...args) => ({type: 'call', fn, args}),
    cps: (fn, ...args) => ({type: 'cps', fn, args}),
    promise: (fn, ...args) => ({type: 'promise', fn, args})
  })

  const next = val => {
    const {done, value} = stream.next(val)
    if (!done) handle(value, next)
  }

  next(stream)
}

function handle (effect, cb) {
  const {type, fn, args} = effect

  // just in case the final stream should be putting values
  if (type === 'put') cb()

  else if (type === 'call') cb(fn(...args))

  else if (type === 'cps') {
    fn(...args, (err, ..._args) => {
      if (err) thro(type, fn.name)(err)
      else cb(..._args)
    })
  }

  else if (type === 'promise') fn(...args).then(response => cb(response)).catch(thro(type, fn.name))

  else throw new Error(`Expected type of effect to be one of 'call, promise, or cps', got: ${type}`)
}

const thro = (type, name) => err => {
  throw new Error(`Handling a ${type}, calling ${name} I got an error: ${err}`)
}
