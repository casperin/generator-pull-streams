const tape = require('tape')
const {pipe, pull} = require('../index')

tape('Simple test of pull', t => {
  t.plan(2)
  const fn = x => {
    t.pass('fn was called')
    return x + 1
  }
  const stream = function * ({call, put}) {
    const two = yield call(fn, 1)
    yield put(two)
    t.equal(two, 2, 'Stream was called to end')
  }
  pull(stream)
})

tape('Pipe returns a generator', t => {
  const stream = pipe(function * () {}, function * () {})
  t.equal(stream.constructor.name, 'GeneratorFunction', 'pipe returns generator')
  t.end()
})

tape('Pipe pulls values through to the pull', t => {
  const inc10 = x => x + 10
  const source = [1, 2, 3, 4, 5]
  function * thru1 ({take, put, call}) {
    const one = yield take()
    const eleven = yield call(inc10, one)
    yield put(eleven)
    yield put(12)
  }
  function * thru2 ({take, put, call}) {
    const eleven = yield take()
    const twelve = yield take()
    const twentyOne = yield call(inc10, eleven)
    yield put(twelve)
    yield put(twentyOne)
    t.fail('Should never reach this point')
  }
  function * sink ({take}) {
    const twelve = yield take()
    t.equal(twelve, 12, 'Got first value')
    const twentyOne = yield take()
    t.equal(twentyOne, 21, 'Got second value')
    t.end()
  }

  const stream = pipe(source, thru1, thru2, sink)
  pull(stream)
})

