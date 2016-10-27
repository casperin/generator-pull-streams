
module.exports = (opt = {}) => function * flatten ({take, put}) {
  let arr = yield take()
  while (true) {
    const data = arr.shift()
    if (opt.deep && Array.isArray(data)) {
      arr = data.concat(arr)
      continue
    }
    yield put(data)
    if (!arr.length) arr = yield take()
  }
}
