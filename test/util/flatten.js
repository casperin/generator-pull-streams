const tape = require('tape')
const {pipe, pull} = require('../../index')
const flatten = require('../../util/flatten')

tape('flatten', t => {
  t.plan(9)
  let m = 2
  const source = [
    [[0, 1], 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ]
  function * sink ({take}) {
    const n = yield take()
    t.deepEqual(n, [0, 1])
    while (true) {
      const n = yield take()
      t.equal(n, m++)
    }
  }
  const stream = pipe(source, flatten(), sink)
  pull(stream)
})

tape('flatten - opt.deep', t => {
  t.plan(9)
  let m = 1
  const source = [
    [1, 2, 3, [4, 5, [6, 7]]],
    [8, 9]
  ]
  function * sink ({take}) {
    while (true) {
      const n = yield take()
      t.equal(n, m++)
    }
  }
  const stream = pipe(source, flatten({deep: true}), sink)
  pull(stream)
})

