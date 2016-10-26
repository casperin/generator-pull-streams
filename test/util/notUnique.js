const tape = require('tape')
const {pipe, pull} = require('../../index')
const notUnique = require('../../util/notUnique')

tape('notUnique', t => {
  t.plan(2)
  let m = 1
  const source = [1, 2, 1, 3, 2]
  function * sink ({take}) {
    while (true) {
      const n = yield take()
      t.equal(n, m++)
    }
  }
  const stream = pipe(source, notUnique(), sink)
  pull(stream)
})

tape('notUnique - compare', t => {
  t.plan(2)
  let m = 1
  const compare = x => x.a
  const source = [
    {a: 0, b: 1},
    {a: 1, b: 2},
    {a: 0, b: 1},
    {a: 2, b: 3},
    {a: 1, b: 2},
  ]
  function * sink ({take}) {
    while (true) {
      const d = yield take()
      t.equal(d.b, m++)
    }
  }
  const stream = pipe(source, notUnique(compare), sink)
  pull(stream)
})

tape('notUnique - compare - cps', t => {
  t.plan(2)
  let m = 1
  const compare = (x, cb) => cb(null, x.a)
  const source = [
    {a: 0, b: 1},
    {a: 1, b: 2},
    {a: 0, b: 1},
    {a: 2, b: 3},
    {a: 1, b: 2},
  ]
  function * sink ({take}) {
    while (true) {
      const d = yield take()
      t.equal(d.b, m++)
    }
  }
  const stream = pipe(source, notUnique(compare, {cps: true}), sink)
  pull(stream)
})

tape('notUnique - compare - promise', t => {
  t.plan(2)
  let m = 1
  const compare = x => Promise.resolve(x.a)
  const source = [
    {a: 0, b: 1},
    {a: 1, b: 2},
    {a: 0, b: 1},
    {a: 2, b: 3},
    {a: 1, b: 2},
  ]
  function * sink ({take}) {
    while (true) {
      const d = yield take()
      t.equal(d.b, m++)
    }
  }
  const stream = pipe(source, notUnique(compare, {promise: true}), sink)
  pull(stream)
})
