module.exports = (reducer, opt = {}) => function * scan ({take, put, call, cps, resolve}) {
  let effect = call
  if (opt.cps) effect = cps
  if (opt.promise) effect = resolve

  let acc

  while (true) {
    const data = yield take()
    if (acc) acc = yield effect(reducer, acc, data)
    else acc = data
    yield put(acc)
  }
}
