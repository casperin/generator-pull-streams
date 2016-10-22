module.exports = (...streams) => streams.reduce(pipe)

const pipe = (sourceGen, destGen) => {
  const piped = function * (effects) {
    // Support passing in any type of generator or iterator as the source
    const source = typeof sourceGen === 'function'
      ? sourceGen(effects)
      : function * () { for (const value of sourceGen) yield effects.put(value) }()

    const dest = destGen(effects)

    let destReturnValue, sourceReturnValue

    runDest: while (true) {
      const destData = dest.next(destReturnValue)
      if (destData.done) return
      const type = destData.value && destData.value.type

      if (type === 'put' || type === 'call' || type === 'cps' || type === 'promise') {
        destReturnValue = yield destData.value
        continue runDest
      }

      runSource: while (true) {
        const sourceData = source.next(sourceReturnValue)
        if (sourceData.done) return
        const type = sourceData.value && sourceData.value.type

        if (type === 'put') {
          destReturnValue = sourceData.value.value
          continue runDest
        }

        if (type === 'call' || type === 'cps' || type === 'promise') {
          sourceReturnValue = yield sourceData.value
          continue runSource
        }

        throw new Error('A source has nothing to yield values from.')
      }
    }
  }

  Object.defineProperty(piped, 'name', {value: `${sourceGen.name || 'unknown source'} → ${destGen.name}`});

  return piped
}
