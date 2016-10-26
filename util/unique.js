const id = x => x

module.exports = (compare = id, opt = {}) => function * unique ({take, put, call, cps, resolve}) {
  let effect = call
  if (opt.cps) effect = cps
  if (opt.promise) effect = resolve
  const seen = new Set()
  while (true) {
    const data = yield take()
    const v = yield effect(compare, data)
    if (seen.has(v)) continue
    seen.add(v)
    yield put(data)
  }
}
