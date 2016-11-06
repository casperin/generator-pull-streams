const {isEffect, isEffectOfType} = require('./pull')

// Helper to allow users to yield without using `take` and `put`.
const valueToEffect = (value, effects) => {
  if (isEffect(value)) return value
  return value === undefined ? effects.take() : effects.put(value)
}

module.exports = (...streams) => streams.reduce(pipe)

/**
 * `pipe` is a reducer function in that it takes two streams and turn them into
 * one. More specifically it takes a source (that does not take any values) and
 * any other stream and turn them into another source.
 */
const pipe = (source, destination) => {
  const piped = function * (effects) {
    const dest = destination(effects)
    const src = typeof source === 'function'
      ? source(effects)
      : (function * () { yield * source }()) // [] → iterable

    let destReturnValue,
      destThrowData,
      srcReturnValue,
      srcThrowData

    /**
     * Run through destination and let `pull` handle everything that isn't a
     * `take` effect by yielding them. Once we have a `take`, we continue to
     * the source searching for a `put` effect with a value and break out,
     * again letting the `pull` deal with everything that isn't a `put`. If
     * any of the generators ends, so does this function.
     */
    while (true) {
      const {value, done} = destThrowData || dest.next(destReturnValue)
      destThrowData = null
      if (done) return
      const effect = valueToEffect(value, effects)

      if (!isEffectOfType('take', effect)) {
        try {
          destReturnValue = yield effect
        } catch (e) {
          destThrowData = dest.throw(e)
        }
        continue // no take yet, so we run dest loop again
      }

      // enable destination to communicate with the source in the take yield,
      // by yield take('foo')
      srcReturnValue = effect.value

      while (true) {
        const {value, done} = srcThrowData || src.next(srcReturnValue)
        srcThrowData = null
        if (done) return
        const effect = valueToEffect(value, effects)

        if (isEffectOfType('put', effect)) {
          destReturnValue = effect.value
          break // got a value for dest, so we break out of the source loop
        }

        // anything else, we let the `pull` deal with
        try {
          srcReturnValue = yield effect
        } catch (e) {
          srcThrowData = src.throw(e)
        }
      }
    }
  }

  Object.defineProperty(piped, 'name', {
    value: `${source.name || 'unknown source'} → ${destination.name || 'unknown destination'}`
  })

  return piped
}
