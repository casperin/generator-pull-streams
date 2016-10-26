const tape = require('tape')
const {pipe, pull} = require('../../index')
const find = require('../../util/find')

tape('find', t => {
  t.plan(1)
  const isEven = x => x % 2 === 0
  const source = [1, 2, 3, 4]
  function * sink ({take}) {
    while (true) {
      const n = yield take()
      t.equal(n, 2)
    }
  }
  const stream = pipe(source, find(isEven), sink)
  pull(stream)
})

tape('find - cps', t => {
  t.plan(1)
  const isEven = (x, cb) => cb(null, x % 2 === 0)
  const source = [1, 2, 3, 4]
  function * sink ({take}) {
    while (true) {
      const n = yield take()
      t.equal(n, 2)
    }
  }
  const stream = pipe(source, find(isEven, {cps: true}), sink)
  pull(stream)
})

tape('find - promise', t => {
  t.plan(1)
  const isEven = x => Promise.resolve(x % 2 === 0)
  const source = [1, 2, 3, 4]
  function * sink ({take}) {
    while (true) {
      const n = yield take()
      t.equal(n, 2)
    }
  }
  const stream = pipe(source, find(isEven, {promise: true}), sink)
  pull(stream)
})

