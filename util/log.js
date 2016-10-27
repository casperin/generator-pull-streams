
module.exports = (logger = console.log) => function * log ({take, put}) {
  while (true) {
    const data = yield take()
    logger(data)
    yield put(data)
  }
}
