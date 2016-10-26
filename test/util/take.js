const tape = require('tape')
const {pipe, pull} = require('../../index')
const take = require('../../util/take')

tape('take', t => {
  t.plan(2)
  const source = [1, 2, 3, 4, 5]
  function * sink ({take}) {
    while (true) {
      yield take()
      t.pass()
    }
  }
  const stream = pipe(source, take(2), sink)
  pull(stream)
})


