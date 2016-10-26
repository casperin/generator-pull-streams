
module.exports = (pred, opt = {}) => function * until ({take, put, call, cps, resolve}) {
  let effect = call
  if (opt.cps) effect = cps
  if (opt.promise) effect = resolve
  while (true) {
    const data = yield take()
    const cond = yield effect(pred, data)
    if (cond) {
      if (opt.last) yield put(data)
      return
    }
    yield put(data)
  }
}
