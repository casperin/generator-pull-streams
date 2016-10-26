const tape = require('tape')
const {pipe, pull} = require('../../index')
const cpsMap = require('../../util/cpsMap')

tape('cpsMap', t => {
  t.plan(3)
  let m = 2
  const inc = (x, cb) => setTimeout(() => cb(null, x + 1), 50)
  const source = [1, 2, 3]
  function * sink ({take}) {
    while (true) {
      const n = yield take()
      t.equal(n, m)
      m++
    }
  }
  const stream = pipe(source, cpsMap(inc), sink)
  pull(stream)
})


