# Generator pull streams

This is a possible implementation of how pull-streams would work with
generators (arrived with Node 6). It is very much a proof of concept, rather
than a full implementation.

```js
const {pipe, pull} = require('generator-pull-streams')

const stream = pipe(
  function * A ({cps, put}) {
    let id = 0
    while (true) {
      const data = yield cps(api, `/some/url/${id}`)
      yield put(data.thing)
      id++
    }
  },
  function * B ({take, call}) {
    while (true) {
      const thing = yield take()
      const otherThing = yield call(toOtherThing, thing)
      console.log('Here is the other thing!')
    }
  }
)

pull(stream)
```

Pull will start pulling values through. If any of them ends then the whole
stream stops.

Above you see 4 different helper functions being used: `put`, `take`, `call`,
and `cps`. There are two more: `call` and `promise`.

* `put` is used to pass a value on to the next generator in the pipe (in this
  case, from `A` to `B`).
* `take` is used to fetch the next value. Notice that the very first stream can
  not `yield` a `take` since it has nowhere to take a value from.
* `call` is to call functions. Functions here are expected to be syncronous.
* `cps` is to call a node style "error first" type function that takes a
  `callback` as its last parameter.
* `promise` is the last one, and expects a promise to call and resolve for you.

## Other

* Values flow from left to right (from `A` to `B` in the above example).
* `pipe` takes any number of streams, not just two.
* The first argument to `pipe` may be any type of iterator. Including arrays
  and strings.
* The streams coming out of pipe should compose quite well. So you can create a
  "sub stream" and pass it around to be included elsewhere.

## License

MIT

