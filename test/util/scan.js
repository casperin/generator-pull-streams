const tape = require('tape')
const {pipe, pull} = require('../../index')
const scan = require('../../util/scan')

tape('scan', t => {
  t.plan(3)
  const add = (a, b) => a + b
  const source = [1, 2, 3]
  function * sink ({take}) {
    let n
    n = yield take()
    t.equal(n, 1)
    n = yield take()
    t.equal(n, 3)
    n = yield take()
    t.equal(n, 6)
  }
  const stream = pipe(source, scan(add), sink)
  pull(stream)
})

tape('scan - cps', t => {
  t.plan(3)
  const add = (a, b, cb) => cb(null, a + b)
  const source = [1, 2, 3]
  function * sink ({take}) {
    let n
    n = yield take()
    t.equal(n, 1)
    n = yield take()
    t.equal(n, 3)
    n = yield take()
    t.equal(n, 6)
  }
  const stream = pipe(source, scan(add, {cps: true}), sink)
  pull(stream)
})

tape('scan - promise', t => {
  t.plan(3)
  const add = (a, b) => Promise.resolve(a + b)
  const source = [1, 2, 3]
  function * sink ({take}) {
    let n
    n = yield take()
    t.equal(n, 1)
    n = yield take()
    t.equal(n, 3)
    n = yield take()
    t.equal(n, 6)
  }
  const stream = pipe(source, scan(add, {promise: true}), sink)
  pull(stream)
})

