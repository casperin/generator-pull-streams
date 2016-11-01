[![CircleCI](https://circleci.com/gh/casperin/generator-pull-streams.svg?style=svg)](https://circleci.com/gh/casperin/generator-pull-streams)

# Generator pull streams

This is a possible implementation of how
[pull-streams](https://github.com/pull-stream/pull-stream) would work with
generators (arrived with Node 6).

Value flows through the stream as they are being pulled out from the end.


## Install

```sh
npm install generator-pull-stream
```


## How to use

Here's a basic example. `A` "puts" values as they get back from the `api`, and
`B` "takes" them, one by one, and does its thing to them before passing them
on. `tap` (which is documented later) basically will pull out as many values as
it can and `console.log`s them. Once `A`'s `id` reaches `11` it returns, and
the entire stream ends.

```js
const {pipe, pull} = require('generator-pull-streams')
const {tap} = require('generator-pull-streams/util')

const stream = pipe(
  function * A ({cps, put}) {
    let id = 0
    while (true) {
      const data = yield cps(api, `/some/url/${id}`)
      yield put(data.thing)
      id++
      if (id > 10) return
    }
  },
  function * B ({take, call}) {
    while (true) {
      const thing = yield take()
      const otherThing = yield call(toOtherThing, thing)
      yield put(otherThing)
    }
  },
  tap()
)

pull(stream)
```

Pull will start pulling values through. If any of them ends then the whole
stream stops.

Above you see four different helper functions being used: `put`, `take`,
`call`, and `cps`. There are tow more: `resolve`, and `wait`.

* `yield put(value)` is used to pass a value on to the next generator in the
  pipe (in this case, from `A` to `B`).
  * You can also do `yield value` as a shorthand.
* `yield take([value])` is used to fetch the next value. Notice that the very
  first stream can not `yield` a `take` since it has nowhere to take a value
  from.
  * Shorthand is to just do `yield` without anything.
* `yield call(fn, arg1, arg2, ...)` is to call functions. Functions here are
  expected to be synchronous.
* `yield cps(fn, arg1, arg2, ...)` is to call a node style "error first" type
  function that takes a `yield callback` as its last parameter.
  * To catch errors wrap the `yield` in a `try/catch`.
* `yield resolve(fn, arg1, arg2, ...)` expects a promise to call and resolve
  for you.
* `yield wait(2000)` pauses for two seconds, then resumes.


## More information

* Values flow from left to right (from `A` to `B` to `tap` in the above
  example).
* If any sub-stream returns, the entire stream stops.
* If any sub-stream throws, the entire stream stops.
* `pipe` takes any number of streams, not just two.
* The first argument to `pipe` may be any type of iterator. Including arrays
  and strings.
* The streams coming out of pipe should compose quite well. So you can create a
  "sub stream" and pass it around to be included elsewhere.
* You can communicate with a source when a stream `take`s a value, by passing
  it into the take: `const data = yield take('give me something great!')`.
* Streams will not start running until some calls `pull` on them. As such, they
  are pure (calling `pipe` with the same arguments will always give you the
  same value back. No side effects or randomness).


## Some words

There is nothing wrong with
[pull-streams](https://github.com/pull-stream/pull-stream). Theoretically it
just seemed to be something generators would be suited for; so as part of
really digging into pull-streams, I decided to implement them with generators.
While they aren't as mathematically beautiful, I have to say that I like the
interface of using generators much more.

I should mention the amazing
[redux-saga](https://github.com/yelouafi/redux-saga) library as inspiration for
the interface and async model.


## Utils

I've included some helper functions in `/util`.

### `tap(fn)`

Will call `fn` with every value coming through. `fn` defaults to `console.log`
if nothing is passed in.

### `filter(fn, options)`

```js
const {pipe, pull} = require('generator-pull-stream')
const {filter, tap} = require('generator-pull-stream/util')

const source = [1, 2, 3, 4, 5, 6]
const filterEven = filter(x => x % 2 === 0)
const log = tap()
const stream = pipe(source, filterEven, log)
pull(stream) // logs 2, 4, 6
```

Pass in `{cps: true}` as `options` if the filter function is a node callback
style function.  Pass in `{promise: true}` if the function returns a promise.

### `reject(fn, options)`

The reverse of filter above.

### `find(fn, options)`

Same as find, except it cancels the stream once the first matching item has
been found.

### `flatten(options)`

By default this will flatten a stream one level (it assumes arrays coming in).
If you pass `{deep: true}` if you want it to flatten every array that it
encounters.

### `map(fn, options)`

Maps your function over every value in the stream. Pass `{cps: true}` if the
function is a node callback style function, or `{promise: true}` if it returns
a promise.

### `take(n)`

Takes the first `n` values, then cancels the stream.

### `until(fn, options)`

Takes values until the function passes. For instance

```js
const source = [1, 2, 3, 4, 5]
const gt3 = x => x > 3
const stream = pipe(source, until(gt3), tap())
pull(stream) // logs 1, 2, 3
```

Pass in `{last: true}` if you want the last value also (above that would be
`4`).

Pass `{cps: true}` if the function is a node callback style function, or
`{promise: true}` if it returns a promise.

### `scan(fn, options)`

Much like reduce, except it gives you every intermediary value and not just the
end result.

```js
const source = [1, 2, 3, 4]
const add = (a, b) => a + b
const stream = pipe(source, scan(add), tap())
pull(stream) // logs 1, 3, 6, 10
```

Pass `{cps: true}` if the function is a node callback style function, or
`{promise: true}` if it returns a promise.

### `throttle(ms)`

Makes sure value do not pass through faster than the `ms` you passed in.

```js
const source = [1, 2, 3]
const stream = pipe(source, throttle(500), tap())
pull(stream) // logs 1, 2, 3 with 500ms interval
```

### `unique(fn, options)`

Gives you only unique values. The `fn` is for camparing on something specific,
for instance you can pass in `x => x.id` to compare on the `ids`.

Pass `{cps: true}` if the function is a node callback style function, or
`{promise: true}` if it returns a promise.

### `notUnique(fn, options)`

Reverse of `unique`.

### `convertPullStream(through)`

Takes any (I hope) pull-stream `through` and converts into a generator pull
stream.

```js
const flatten = require('pull-stream/throughs/flatten')
const {convertPullStream, tap} = require('generator-pull-stream/util')
const {pipe, pull} = require('generator-pull-stream')

const source = [[1, 2, 3], [4, 5, 6]]
const generatorFlatten = convertPullStream(flatten())

const stream = pipe(source, generatorFlatten, tap())
pull(stream) // logs 1, 2, 3, 4, 5, 6,
```

This function should be regarded as semi experimental. Any help with testing
and updating it would be helpful.


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

The full `stream` from above can be tested in the same manner.

## License

MIT

