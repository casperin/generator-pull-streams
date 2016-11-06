
module.exports = (fn, opt = {}) => function * map ({take, put, call, cps, resolve}) {
  let effect = call
  if (opt.cps) effect = cps
  if (opt.promise) effect = resolve
  while (true) {
    const data = yield take()
    let mappedData
    try {
      mappedData = yield effect(fn, data)
    } catch (err) {
      if (opt.ignoreError) continue
      throw new Error(err)
    }
    yield put(mappedData)
  }
}

