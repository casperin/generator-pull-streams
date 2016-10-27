
module.exports = (fn = console.log) => function * tap ({take, put}) {
  while (true) {
    const data = yield take()
    fn(data)
    yield put(data)
  }
}
