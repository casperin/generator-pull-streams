const tape = require('tape')
const {pipe, pull} = require('../../index')
const map = require('../../util/map')

tape('map', t => {
  t.plan(3)
  let m = 2
  const inc = x => x + 1
  const source = [1, 2, 3]
  function * sink ({take}) {
    while (true) {
      const n = yield take()
      t.equal(n, m)
      m++
    }
  }
  const stream = pipe(source, map(inc), sink)
  pull(stream)
})

tape('map - cps', t => {
  t.plan(3)
  let m = 2
  const inc = (x, cb) => cb(null, x + 1)
  const source = [1, 2, 3]
  function * sink ({take}) {
    while (true) {
      const n = yield take()
      t.equal(n, m)
      m++
    }
  }
  const stream = pipe(source, map(inc, {cps: true}), sink)
  pull(stream)
})

tape('map - promise', t => {
  t.plan(3)
  let m = 2
  const inc = x => Promise.resolve(x + 1)
  const source = [1, 2, 3]
  function * sink ({take}) {
    while (true) {
      const n = yield take()
      t.equal(n, m)
      m++
    }
  }
  const stream = pipe(source, map(inc, {promise: true}), sink)
  pull(stream)
})

tape('map - ignoreError', t => {
  t.plan(2)
  const inc = x => {
    if (x === 2) { throw Error('x is two!') }
    return x + 1
  }
  function * source ({put}) {
    yield put(1)
    yield put(2)
    yield put(3)
  }
  function * sink ({take}) {
    const a = yield take()
    t.equal(a, 2)
    const b = yield take()
    t.equal(b, 4)
  }
  const stream = pipe(source, map(inc, {ignoreError: true}), sink)
  pull(stream)
})
