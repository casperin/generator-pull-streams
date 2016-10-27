const tape = require('tape')
const {pipe, pull} = require('../../index')
const log = require('../../util/log')

tape('log', t => {
  t.plan(3)
  let m = 1
  const source = [1, 2, 3]
  const logger = x => {
    t.equal(x, m++)
  }
  const stream = pipe(source, log(logger))
  pull(stream)
})
