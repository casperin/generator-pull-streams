
module.exports = ms => function * throttle ({take, put, wait}) {
  let time
  while (true) {
    const data = yield take()
    const diff = Date.now() - time
    if (time && diff < ms) yield wait(ms - diff)
    yield put(data)
    time = Date.now()
  }
}
