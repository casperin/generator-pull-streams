const workhorse = require('generator-workhorse')()

workhorse.extend([{
  type: 'put',
  effect: value => ({type: 'put', value}),
  handle: (_, cb) => cb()
}, {
  type: 'take',
  effect: value => ({type: 'take', value}),
  handle: (_, cb) => { throw Error('Sources should not `take`') }
}])

module.exports = function pull (stream) {
  stream = stream(module.exports.effects)

  const next = (err, data) => {
    if (err) {
      stream.throw(err)
    } else {
      const {done, value} = stream.next(data)
      if (!done) workhorse.handleEffect(value, next)
    }
  }

  next()
}

module.exports.effects = workhorse.effects
module.exports.isEffect = workhorse.isEffect
module.exports.isEffectOfType = workhorse.isEffectOfType
