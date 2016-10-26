const tape = require('tape')
const {pipe, pull} = require('../../index')
const throttle = require('../../util/throttle')

tape('throttle', t => {
  t.plan(3)
  let data = 0
  const source = [1, 2, 3]
  function * sink ({take}) {
    while (true) {
      data = yield take()
    }
  }
  setTimeout(() => t.equal(data, 1), 50)
  setTimeout(() => t.equal(data, 2), 150)
  setTimeout(() => t.equal(data, 3), 250)
  const stream = pipe(source, throttle(100), sink)
  pull(stream)
})



