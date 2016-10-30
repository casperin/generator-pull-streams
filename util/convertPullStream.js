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

  const readable = through(read)

  const wrappedReadable = _cb => {
    cb = _cb
    readable(null, (abort, output) => {
      if (abort === true) cb(null, {done: true})
      else                cb(abort, {output})
    })
  }

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

