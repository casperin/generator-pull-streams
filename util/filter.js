
module.exports = (fn, opt = {}) => function * filter ({take, put, call, cps, resolve}) {
  let effect = call
  if (opt.cps) effect = cps
  if (opt.promise) effect = resolve
  while (true) {
    const data = yield take()
    const cond = yield effect(fn, data)
    if (cond) yield put(data)
  }
}
