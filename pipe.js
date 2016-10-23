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

    let destReturnValue, srcReturnValue // communication between loops

    /**
     * Run through destination and let `pull` handle everything that isn't a
     * `take` effect by yielding them. Once we have a `take`, we continue to
     * the source searching for a `put` effect with a value and break out,
     * again letting the `pull` deal with everything that isn't a `put`. If
     * any of the generators ends, so does this function.
     */
    while (true) {
      const destData = dest.next(destReturnValue)
      if (destData.done) return
      const {type, value} = getTypeAndValue(destData, effects)

      if (type !== 'take') {
        destReturnValue = yield value
        continue // no take yet, so we run dest loop again
      }

      // enable destination to communicate with the source in the take yield,
      // by yield take('foo')
      if (value) srcReturnValue = value.value

      while (true) {
        const srcData = src.next(srcReturnValue)
        if (srcData.done) return
        const {type, value} = getTypeAndValue(srcData, effects)

        if (type === 'put') {
          destReturnValue = value.value
          break // got a value for dest, so we break out of the source loop
        }

        // anything else, we let the `pull` deal with
        srcReturnValue = yield srcData.value
      }
    }
  }

  Object.defineProperty(piped, 'name', {
    value: `${source.name || 'unknown source'} → ${destination.name || 'unknown destination'}`
  })

  return piped
}

const getTypeAndValue = (data, effects) => {
  if (data.value && data.value.type) return {type: data.value.type, value: data.value}
  if (data.value !== undefined) return {type: 'put', value: effects.put(data.value)}
  return {type: 'take'}
}
