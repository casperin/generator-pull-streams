const tape = require('tape')
const {pipe, pull} = require('../../index')
const unique = require('../../util/unique')

tape('unique', t => {
  t.plan(3)
  let m = 1
  const source = [1, 2, 1, 3, 2]
  function * sink ({take}) {
    while (true) {
      const n = yield take()
      t.equal(n, m++)
    }
  }
  const stream = pipe(source, unique(), sink)
  pull(stream)
})
tape('unique', t => {
  t.plan(3)
  let m = 1
  const source = [1, 2, 1, 3, 2]
  function * sink ({take}) {
    while (true) {
      const n = yield take()
      t.equal(n, m++)
    }
  }
  const stream = pipe(source, unique(), sink)
  pull(stream)
})

tape('unique - compare', t => {
  t.plan(3)
  let m = 1
  const compare = x => x.a
  const source = [
    {a: 0, b: 1},
    {a: 1, b: 2},
    {a: 0, b: 42},
    {a: 2, b: 3},
    {a: 1, b: 52},
  ]
  function * sink ({take}) {
    while (true) {
      const d = yield take()
      t.equal(d.b, m++)
    }
  }
  const stream = pipe(source, unique(compare), sink)
  pull(stream)
})

tape('unique - compare - cps', t => {
  t.plan(3)
  let m = 1
  const compare = (x, cb) => cb(null, x.a)
  const source = [
    {a: 0, b: 1},
    {a: 1, b: 2},
    {a: 0, b: 42},
    {a: 2, b: 3},
    {a: 1, b: 52},
  ]
  function * sink ({take}) {
    while (true) {
      const d = yield take()
      t.equal(d.b, m++)
    }
  }
  const stream = pipe(source, unique(compare, {cps: true}), sink)
  pull(stream)
})

tape('unique - compare - promise', t => {
  t.plan(3)
  const compare = x => Promise.resolve(x.a)
  let m = 1
  const source = [
    {a: 0, b: 1},
    {a: 1, b: 2},
    {a: 0, b: 42},
    {a: 2, b: 3},
    {a: 1, b: 52},
  ]
  function * sink ({take}) {
    while (true) {
      const d = yield take()
      t.equal(d.b, m++)
    }
  }
  const stream = pipe(source, unique(compare, {promise: true}), sink)
  pull(stream)
})
