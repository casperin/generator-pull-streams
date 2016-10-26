const tape = require('tape')
const {pipe, pull} = require('../../index')
const filter = require('../../util/filter')

tape('filter', t => {
  t.plan(2)
  let m = 2
  const isEven = x => x % 2 === 0
  const source = [1, 2, 3, 4]
  function * sink ({take}) {
    while (true) {
      const n = yield take()
      t.equal(n, m)
      m = m + 2
    }
  }
  const stream = pipe(source, filter(isEven), sink)
  pull(stream)
})

tape('filter - cps', t => {
  t.plan(2)
  let m = 2
  const isEven = (x, cb) => cb(null, x % 2 === 0)
  const source = [1, 2, 3, 4]
  function * sink ({take}) {
    while (true) {
      const n = yield take()
      t.equal(n, m)
      m = m + 2
    }
  }
  const stream = pipe(source, filter(isEven, {cps: true}), sink)
  pull(stream)
})

tape('filter - promise', t => {
  t.plan(2)
  let m = 2
  const isEven = x => Promise.resolve(x % 2 === 0)
  const source = [1, 2, 3, 4]
  function * sink ({take}) {
    while (true) {
      const n = yield take()
      t.equal(n, m)
      m = m + 2
    }
  }
  const stream = pipe(source, filter(isEven, {promise: true}), sink)
  pull(stream)
})
