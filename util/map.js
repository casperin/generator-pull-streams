
module.exports = (fn, opt = {}) => function * map ({take, put, call, cps, resolve}) {
  let effect = call
  if (opt.cps) effect = cps
  if (opt.promise) effect = resolve
  while (true) {
    const data = yield take()
    const mappedData = yield effect(fn, data)
    yield put(mappedData)
  }
}

