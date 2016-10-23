# Generator pull streams

This is a possible implementation of how pull-streams would work with
generators (arrived with Node 6).

## Install

```sh
npm install generator-node-stream
```

## Words

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
      console.log('Here is the other thing!', otherThing)
    }
  }
)

pull(stream)
```

Pull will start pulling values through. If any of them ends then the whole
stream stops.

Above you see four different helper functions being used: `put`, `take`,
`call`, and `cps`. There is one more: `resolve`.

* `yield put(value)` is used to pass a value on to the next generator in the
  pipe (in this case, from `A` to `B`).
* `yield take([value])` is used to fetch the next value. Notice that the very
  first stream can not `yield` a `take` since it has nowhere to take a value
  from.
* `yield call(fn, arg1, arg2, ...)` is to call functions. Functions here are
  expected to be syncronous.
* `yield cps(fn, arg1, arg2, ...)` is to call a node style "error first" type
  function that takes a `yield callback` as its last parameter.
* `yield resolve(fn, arg1, arg2, ...)` is the last one, and expects a promise
  to call and resolve for you.

## More words

* Values flow from left to right (from `A` to `B` in the above example).
* `pipe` takes any number of streams, not just two.
* The first argument to `pipe` may be any type of iterator. Including arrays
  and strings.
* The streams coming out of pipe should compose quite well. So you can create a
  "sub stream" and pass it around to be included elsewhere.
* You can communicate with a source when a stream `take`s a value, by passing
  it into the take: `const data = yield take('give me something great!')`.


## Unit testing your streams

Testing your streams is really easy. Let's have a look at `A` from above and
see how we might go about testing it.

Notice that we are effectively testing that we are calling the api with the
correct url, without actually calling it.

```js
function * A ({cps, put}) {
  let id = 0
  while (true) {
    const data = yield cps(api, `/some/url/${id}`)
    yield put(data.thing)
    id++
  }
}

// in our test file
const tape = require('tape')
const api = require('./api')
const {pull} = require('generator-pull-stream')

tape('stream A', t => {
  const a = A(pull.effects)

  const actual1 = a.next().value
  const expected1 = pull.effects.cps(api, '/some/url/0')
  t.deepEqual(actual1, expected1)

  const actual2 = a.next({thing: 'foo'}).value
  const expected2 = pull.effects.put('foo')
  t.deepEqual(actual2, expected2)

  const actual3 = a.next().value
  const expected3 = pull.effects.cps(api, '/some/url/1')
  t.deepEqual(actual3, expected3)

  t.end()
})
```

## License

MIT

