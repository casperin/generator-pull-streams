const tape = require('tape')
const {pipe, pull} = require('../../index')
const tap = require('../../util/tap')

tape('tap', t => {
  t.plan(3)
  let m = 1
  const source = [1, 2, 3]
  const fn = x => {
    t.equal(x, m++)
  }
  const stream = pipe(source, tap(fn))
  pull(stream)
})
