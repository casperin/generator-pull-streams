const tape = require('tape')
const {pipe, pull} = require('../index')

tape('Error handling', t => {
  t.plan(2)
  const throws = () => { throw new Error() }
  function * stream ({call}) {
    try {
      yield call(throws)
      t.fail()
    } catch (e) {
      t.pass()
    }
    t.pass()
  }
  pull(stream)
})
