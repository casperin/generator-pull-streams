
module.exports = n => function * take ({take, put}) {
  while (n-- > 0) {
    const data = yield take()
    yield put(data)
  }
}
