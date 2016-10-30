const tape = require('tape')
const {pipe, pull} = require('../../index')
const through = require('pull-stream/throughs')
const convertPullStream = require('../../util/convertPullStream')

tape('convertPullStream on map (1:1)', t => {
  t.plan(3)
  const source = [1, 2, 3]
  const psMap = through.map(x => x + 1)
  let m = 2
  function * sink ({take}) {
    while (true) {
      const n = yield take()
      t.equal(n, m++, `map for ${n} is okay`)
    }
  }
  const stream = pipe(source, convertPullStream(psMap), sink)
  pull(stream)
})

tape('convertPullStream on flatten (1:many)', t => {
  t.plan(6)
  const source = [[1, 2, 3], [4, 5, 6]]
  let m = 1
  function * sink ({take}) {
    while (true) {
      const n = yield take()
      t.equal(n, m++, `flatten for ${n} is okay`)
    }
  }
  const stream = pipe(source, convertPullStream(through.flatten()), sink)
  pull(stream)
})

tape('convertPullStream on unique (many:1)', t => {
  t.plan(3)
  const source = [1, 2, 1, 2, 3]
  let m = 1
  function * sink ({take}) {
    while (true) {
      const n = yield take()
      t.equal(n, m++, `unique for ${n} is okay`)
    }
  }
  const stream = pipe(source, convertPullStream(through.unique()), sink)
  pull(stream)
})

tape('convertPullStream on filter (many:1)', t => {
  t.plan(3)
  const source = [10, 2, 33, 5, 1]
  const gt3 = x => x > 3
  function * sink ({take}) {
    const a = yield take()
    t.equal(a, 10)
    const b = yield take()
    t.equal(b, 33)
    const c = yield take()
    t.equal(c, 5)
  }
  const stream = pipe(source, convertPullStream(through.filter(gt3)), sink)
  pull(stream)
})

tape('convertPullStream on take (ps stops)', t => {
  t.plan(2)
  const source = [1, 2, 3, 4, 5]
  let m = 1
  function * sink ({take}) {
    while (true) {
      const n = yield take()
      t.equal(n, m++, `unique for ${n} is okay`)
    }
  }
  const stream = pipe(source, convertPullStream(through.take(2)), sink)
  pull(stream)
})
