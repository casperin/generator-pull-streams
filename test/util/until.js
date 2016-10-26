const tape = require('tape')
const {pipe, pull} = require('../../index')
const until = require('../../util/until')

tape('until', t => {
  t.plan(3)
  const gt3 = x => x > 3
  const source = [1, 2, 3, 4, 5]
  function * sink ({take}) {
    while (true) {
      yield take()
      t.pass()
    }
  }
  const stream = pipe(source, until(gt3), sink)
  pull(stream)
})

tape('until - cps', t => {
  t.plan(3)
  const gt3 = (x, cb) => cb(null, x > 3)
  const source = [1, 2, 3, 4, 5]
  function * sink ({take}) {
    while (true) {
      yield take()
      t.pass()
    }
  }
  const stream = pipe(source, until(gt3, {cps: true}), sink)
  pull(stream)
})

tape('until - promise', t => {
  t.plan(3)
  const gt3 = x => Promise.resolve(x > 3)
  const source = [1, 2, 3, 4, 5]
  function * sink ({take}) {
    while (true) {
      yield take()
      t.pass()
    }
  }
  const stream = pipe(source, until(gt3, {promise: true}), sink)
  pull(stream)
})

tape('until - last', t => {
  t.plan(4)
  const gt3 = x => x > 3
  const source = [1, 2, 3, 4, 5]
  function * sink ({take}) {
    while (true) {
      yield take()
      t.pass()
    }
  }
  const stream = pipe(source, until(gt3, {last: true}), sink)
  pull(stream)
})



