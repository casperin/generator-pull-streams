module.exports = through => function * ({put, take, cps}) {
  let input, newInput, cb

  const read = (abort, write) => {
    if (newInput) {
      write(null, input)
      newInput = false
    } else {
      cb(null, {done: true})
    }
  }

  const wrap = readable => _cb => {
    cb = _cb
    readable(null, (done, output) => {
      if (done === true) cb(null, {done})
      else               cb(done, {output})
    })
  }

  const readable        = through(read)
  const wrappedReadable = wrap(readable)

  while (true) {
    input = yield take()
    newInput = true

    while (true) {
      const {done, output} = yield cps(wrappedReadable)
      newInput = false
      if (done) break
      else yield put(output)
    }
  }
}

