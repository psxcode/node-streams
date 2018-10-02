# Node Streams

Install
```
npm install node-streams
```

### `buffer`
transform stream, buffers all chunks until `wait` function calls. Pushes buffered chunks array.
`(options: TransformOptions) => (wait: WaitFn) => Transform`
> `WaitFn = (callback: () => void) => CancelFn`  
`buffered` stream will call `wait` function for timeout, so it is possible to provide different period each time
```ts
import { buffer } from 'node-streams'

// we have the streams with `objectMode` set to true
declare var inStream: ReadableStream
declare var outStream: WritableStream

const wait100ms = (callback: () => void) => {
  const id = setTimeout(callback, 100)
  return () => clearTimeout(id)
}

const buffered = buffer({
  objectMode: true             // set up standard TranformOptions
})(
  wait100ms                    // buffer for 100ms then push accumulated data
)

inStream
  .pipe(buffered)
  .pipe(outStream)
```

### `bufferTime`
buffers all chunks for provided time period. Pushes buffered chunks array.
`(options: TransformOptions) => (ms: number) => Transform`
```ts
import { bufferTime } from 'node-streams'

// we have the streams with `objectMode` set to true
declare var inStream: ReadableStream
declare var outStream: WritableStream

const buffered = buffer({
  objectMode: true             // set up standard TranformOptions
})(
  100                          // buffer for 100ms then push accumulated data
)

inStream
  .pipe(buffered)
  .pipe(outStream)
```

### `combine`
delivers latest values from all streams as an array, ends when any of streams does
`(options: ReadableOptions) => (...streams: ReadableStream[]): ReadableStream`
```ts
import { combine } from 'node-streams'

// we have the streams
declare var stream0: ReadableStream   [..1..2..3..4..]
declare var stream1: ReadableStream   ['a'...'b']

// create combined readable
const combined = combine({
  objectMode: true              // provide standard ReadableOptions
})(stream0, stream1)

combined
  .on('data', ([value0, value1]) => {
     // [undefined, 'a']..[1, 'a']..[2, 'a'].[2, 'b']
  })
  .on('end', () => {})
```

### `concat`
concatenates all streams, subscribing to next on previous has ended
`(options: ReadableOptions) => (...streams: ReadableStream[]): ReadableStream`
```ts
import { concat } from 'node-streams'

// we have the streams
declare var stream0: ReadableStream   [..1..2]
declare var stream1: ReadableStream   [..'a'..'b']

// create combined readable
const combined = concat({
  objectMode: true              // provide standard ReadableOptions
})(stream0, stream1)

combined
  .on('data', ([value0, value1]) => {
     // [..1..2..'a'..'b']
  })
  .on('end', () => {})
```

### `debounce`
skips all fast arriving data, until idle period, after that pushes last received chunk.
`(options: TransformOptions) => (wait: WaitFn) => Transform`
> `debounced` stream will cancel and rearm `wait` function repeatedly on every chunk received.  
`WaitFn = (cb: () => void) => CancelFn`  
provided `wait` function should properly release timeout resources on `CancelFn` call.
```ts
import { debounce } from 'node-streams'

// we have the streams in `objectMode`
declare var inStream: ReadableStream
declare var outStream: WritableStream

// we have `setTimeout` function with baked in 10ms time
// CAUTION: wait function should be able to cancel timeout
const wait10ms = (callback: () => void) => {
  const id = setTimeout(callback, 10)
  return () => clearTimeout(id)
}

const debounced = debounce({
  objectMode: true             // set up standard TranformOptions
})(
  wait10ms                     // debounce stream for 10ms
)

inStream
  .pipe(debounced)
  .pipe(outStream)
```

### `debounceTime`
skips all fast arriving data, until idle period, after that pushes last received chunk.
`(options: TransformOptions) => (ms: number) => Transform`
```ts
import { debounceTime } from 'node-streams'

// we have the streams in `objectMode`
declare var inStream: ReadableStream
declare var outStream: WritableStream

const debounced = debounceTime({
  objectMode: true             // set up standard TranformOptions
})(
  10                           // debounce stream for 10ms
)

inStream
  .pipe(debounced)
  .pipe(outStream)
```

### `delay`
`(options: TransformOptions) => (ms: number) => Transform`
```ts
import { delay } from 'node-streams'

// we have the streams in `objectMode`
declare var inStream: ReadableStream
declare var outStream: WritableStream

const delayed = delay({
  objectMode: true               // set up standard TransformOptions
})(
  100                            // delay stream events up to 100ms
)

inStream
  .pipe(delayed)
  .pipe(outStream)
```

### `distinct`
`(options: TransformOptions) => (isEqual: (a: T, b: T) => boolean) => Transform`
```ts
import { distinct } from 'node-streams'

// we have the streams in `objectMode`
declare var inStream: ReadableStream      // [1..2..2..3..3..2..1]
declare var outStream: WritableStream

const unique = distinct({
  objectMode: true                // set up standard TransformOptions
})(
  (a, b) => a === b               // provide compare function
)

inStream
  .pipe(unique)
  .pipe(outStream)                // [1..2....3....2..1]
```

### `distinctUntilChanged`
`(options: TransformOptions) => Transform`
```ts
import { distinctUntilChanged } from 'node-streams'

// we have the streams in `objectMode`
declare var inStream: ReadableStream      // [1..2..2..3..3..2..1]
declare var outStream: WritableStream

const unique = distinctUntilChanged({
  objectMode: true                // set up standard TransformOptions
})

inStream
  .pipe(unique)
  .pipe(outStream)                // [1..2....3....2..1]
```

### `empty`
`(options: ReadableOptions) => Readable`
```ts
import { empty } from 'node-streams'

// we have the streams in `objectMode`
declare var inStream: ReadableStream
declare var outStream: WritableStream

(myCondition
  ? inStream
  : empty({})
).pipe(outStream)
```

### `filter`
`(options: TransformOptions) => (predicate: (arg: T) => boolean) => Transform`
```ts
import { filter } from 'node-streams'

// we have the streams in `objectMode`
declare var inStream: ReadableStream      // [1..2..3..4..5..6..7]
declare var outStream: WritableStream

const filtered = filter({
  objectMode: true               // provide standard TransformOptions
})(
  a => a % 2 === 0               // is even
)

inStream
  .pipe(filtered)
  .pipe(outStream)              // [..2....4....6..]
```

### `first`
`(options: TransformOptions) => Transform`
```ts
import { first } from 'node-streams'

// we have the streams in `objectMode`
declare var inStream: ReadableStream      // [1..2..3..4..5..6..7]
declare var outStream: WritableStream

const firstTransform = first({
  objectMode: true                // provide standard TransformOptions
})

inStream
  .pipe(firstTransform)
  .pipe(outStream)                // [1]
```

### `from`
`(options: ReadableOptions) => (iterable: Iterable<T>) => Readable`
```ts
import { from } from 'node-streams'

const myStream = from({
  objectMode: true                // provide standard ReadableOptions
})(
  [1, 2, 3, 4, 5]                 // provide Iterable
)

myStream
  .on('data', () => {})           // subscribe and get the data
  .on('end', () => {})
```

### `last`
`(options: TransformOptions) => Transform`
```ts
import { last } from 'node-streams'

// we have the streams in `objectMode`
declare var inStream: ReadableStream      // [1..2..3..4..5..6..7]
declare var outStream: WritableStream

const lastTransform = last({
  objectMode: true                        // provide standard TransformOptions
})

inStream
  .pipe(lastTransform)
  .pipe(outStream)                        // [7]
```

### `map`
`(options: TransformOptions) => (xf: (value: T) => R) => Transform`
```ts
import { map } from 'node-streams'

// we have the streams in `objectMode`
declare var inStream: ReadableStream      // [1..2..3..4]
declare var outStream: WritableStream

const mapped = map({
  objectMode: true                        // provide standard TransformOptions
})(
  x => x * 2
)

inStream
  .pipe(mapped)
  .pipe(outStream)                        // [2..4..6..8]
```

### `merge`
`(options: ReadableOptions) => (...streams: ReadableStreams[]) => Readable`
```ts
import { merge } from 'node-streams'

// we have the streams in `objectMode`
declare var stream0: ReadableStream      // [1...2...3...4]
declare var stream1: ReadableStream      // [..'a'.....'b'...]

const merged = merge({
  objectMode: true                       // provide standard ReadableOptions
})(
  stream0,
  stream1
)

merged
  .on('data' () => {})                   // [1..'a'..2..3..'b'..4..]
  .on('end', () => {})
```

### `of`
`(options: ReadableOptions) => (...values: T[]) => Readable`
```ts
import { of } from 'node-streams'

const myStream = of({
  objectMode: true                       // provide standard ReadableOptions
})(
  1, 2, 3, 4
)

myStream
  .on('data', () => {})                  // [1.2.3.4]
  .on('end', () => {})
```

### `ofAsync`
`(options: ReadableOptions) => (wait: WaitFn) => (...values: T[]) => Readable`
> `WaitFn = (callback: () => void) => UnsubscribeFn`
```ts
import { ofAsync } from 'node-streams'

// we have custom wait function
const wait100ms = (cb: () => void) => {
  const id = seTimeout(cb, 100)
  return () => clearTimeout(id)
}

const myStream = ofAsync({
  objectMode: true                  // provide standard ReadableOptions
})(
  wait100ms                         // set WaitFn
)(
  1, 2, 3, 4, 5                     // provide values
)

myStream
  .on('data', () => {})             // [1...2...3...4...5]
  .on('end', () => {})
```

### `ofTime`
`(options: ReadableOptions) => (ms: number) => (...values: T[]) => Readable`
```ts
import { ofTime } from 'node-streams'

const myStream = ofTime({
  objectMode: true                   // provide standard ReadableOptions
})(
  100                                // provide time in milliseconds
)(
  1, 2, 3, 4                         // values to stream
)

myStream
  .on('data', () => {})              // [1...2...3...4]
  .on('end', () => {})
```

### `pipe`
`(...streams: Array<ReadWriteStream | ReadWriteStream[]>) => ReadWriteStream[]`
```ts
import { pipe } from 'node-streams'

// we have the following streams
declare var inStream: ReadableStream
declare var outStream: WritableStream

declare var tripleValues: TransformStream
declare var isEvenValues: TransformStream
declare var takeFirstValue: TransformStream

const tripleEven = pipe(
  tripleValues,
  isEvenValues
)

const firstTripleEven = pipe(
  tripleEven,
  takeFirstValue
)

pipe(
  inStream,
  firstTripleEven,
  outStream
)
```

### `pluck`
`(opts: TransformOptions) => (propName: string) => Transform`
```ts
import { pluck } from 'node-streams'

// we have the following streams in "objectMode"
declare var inStream: ReadableStream
declare var outStream: WritableStream

const pluckMyProp = pluck({
  objectMode: true              // provide standard TransformOptions
})(
  'my-prop'                     // property name
)

inStream
  .pipe(pluckMyProp)
  .pipe(outStream)
```

### `reduce`
`(options: TransformOptions) => (reducer: (state: S, value: T) => S) => Transform`
```ts
import { reduce } from 'node-streams'

// we have the following streams in "objectMode"
declare var inStream: ReadableStream    // [1..2..3..4]
declare var outStream: WritableStream

// we have the following reducer
const addAll = (acc = 0, value: number) => acc + value

const reduceTransform = reduce({
  objectMode: true               // provide standard TransformOptions
})(
  addAll                         // set the reducer
)

inStream
  .pipe(reduceTransform)
  .pipe(outStream)               // [............10]
```

### `scan`
`(options: TransformOptions) => (reducer: (state: S, value: T) => S) => Transform`
```ts
import { scan } from 'node-streams'

// we have the following streams in "objectMode"
declare var inStream: ReadableStream    // [1..2..3..4]
declare var outStream: WritableStream

// we have the following reducer
const addAll = (acc = 0, value: number) => acc + value

const scanTransform = reduce({
  objectMode: true                //provide standard TransformOptions
})(
  addAll
)

inStream
  .pipe(scanTransform)
  .pipe(outStream)                // [1..3..6..10]
```

### `side`
`(options: TransformOptions) => (sideEffect: (value: T) => void) => Transform`
```ts
import { side } from 'node-streams'

// we have the following streams in "objectMode"
declare var inStream: ReadableStream    // [1..2..3..4]
declare var outStream: WritableStream

const sideEffect = side({
  objectMode: true                // provide standard TransformOptions
})(
  console.log
)

inStream
  .pipe(sideEffect)
  .pipe(outStream)
```

### `skip`
`(options: TransformOptions) => (numSkip: number) => Transform`
```ts
import { skip } from 'node-streams'

// we have the following streams in "objectMode"
declare var inStream: ReadableStream    // [1..2..3..4]
declare var outStream: WritableStream

const skipTransform = skip({
  objectMode: true                // provide standard TransformOptions
})(
  2                               // skip 2 chunks
)

inStream
  .pipe(skipTransform)
  .pipe(outStream)                // [....3..4]
```

### `startWith`
`(options: ReadableOptions) => (...values: T[]) => (readable: ReadableStream) => Readable`
```ts
import { startWith } from 'node-streams'

// we have the following streams in "objectMode"
declare var inStream: ReadableStream    // [1..2..3..4]
declare var outStream: WritableStream

const prependedReadable = startWith({
  objectMode: true                 // provide standard ReadableOptions
})(
  'a', 'b', 'c'
)(
  inStream                         // provide the stream to prepend
)

prependedReadable.pipe(outStream)  // ['a'.'b'.'c'.1..2..3..4]
```

### `take`
`(options: TransformOptions) => (numTake: number) => Transform`
```ts
import { take } from 'node-streams'

// we have the following streams in "objectMode"
declare var inStream: ReadableStream    // [1..2..3..4]
declare var outStream: WritableStream

const takeTransform = take({
  objectMode: true                // provide standard TransformOptions
})(
  2                               // take 2 chunks
)

inStream
  .pipe(takeTransform)
  .pipe(outStream)                // [1..2]
```

### `throttle`
`(options: TransformOptions) => (wait: WaitFn) => Transform`
```ts
import { throttle } from 'node-streams'

// we have the streams in `objectMode`
declare var inStream: ReadableStream
declare var outStream: WritableStream

// we have `setTimeout` function with baked in 10ms time
// CAUTION: wait function should be able to cancel timeout
const wait10ms = (callback: () => void) => {
  const id = setTimeout(callback, 10)
  return () => clearTimeout(id)
}

const throttled = throttle({
  objectMode: true             // set up standard TranformOptions
})(
  wait10ms                     // debounce stream for 10ms
)

inStream
  .pipe(throttled)
  .pipe(outStream)
```

### `throttleTime`
`(options: TransformOptions) => (ms: number) => Transform`
```ts
import { throttleTime } from 'node-streams'

// we have the streams in `objectMode`
declare var inStream: ReadableStream
declare var outStream: WritableStream

const throttled = debounceTime({
  objectMode: true             // set up standard TranformOptions
})(
  10                           // debounce stream for 10ms
)

inStream
  .pipe(throttled)
  .pipe(outStream)
```

### `withLatest`
`(options: ReadableOptions) => (...streams: ReadableStream[]) => (mainStream: ReadableStream) => Readable`
```ts
import { withLatest } from 'node-streams'

// we have the streams in `objectMode`
declare var mainStream: ReadableStream  // [1..2..3]
declare var stream0: ReadableStream     // ['a'..'b']
declare var stream1: ReadableStream     // [true............false]

const combined = withLatest({
  objectMode: true                      // standard ReadableOptions
})(
  stream0,
  stream1                               // streams to take the latest values
)(
  mainStream                            // mainStream to sync with
)

combined
  .on('data', () => {})                 // [[1, 'a', true]..[2, 'a', true]..[3, 'b', true]]
  .on('end', () => {})
```

### `zip`
`(options: ReadableOptions) => (...streams: ReadableStream[]) => Readable`
```ts
import { zip } from 'node-streams'

// we have the streams in `objectMode`
declare var stream0: ReadableStream     // ['a'..'b']
declare var stream1: ReadableStream     // [true............false]

const combined = zip({
  objectMode: true                      // standard ReadableOptions
})(
  stream0,
  stream1                               // streams to combine
)

combined
  .on('data', () => {})                 // [['a', true]..........['b', false]]
  .on('end', () => {})
```

### `subscribe`
`({ next, error?, complete? }: IObserver) => (...streams: ReadableStream[]) => UnsubscribeFn`
```ts
type IObserver = {
  next: (value: T) => void,
  error?: (e: Error) => void,
  complete?: () => void
}
type UnsubscribeFn = () => void
```
```ts
import { subscribe } from 'node-streams'

// we have the following streams
declare var stream0: ReadableStream    // [1..2..3]
declare var stream1: ReadableStream    // [..'a'..'b'..]

const unsub = subscribe({
  next: console.log                    // [1..'a'..2..3..'b'..]
})(
  stream0,
  stream1
)
```

### `subscribeEx`
`({ next, error?, complete? }: IObserverEx) => (...streams: ReadableStream[]) => UnsubscribeFn`
```ts
type EmitterValue = {
  value: T,
  index: number,
  emitter: EventEmitter,
  emitterIndex: number,
  event: string
}
type IObserverEx = {
  next: (value: EmitterValue) => void,
  error?: (e: Error) => void,
  complete: () => void
}
type UnsubscribeFn = () => void
```
```ts
import { subscribeEx } from 'node-streams'

// we have the following streams
declare var stream0: ReadableStream    // [1..2..3]
declare var stream1: ReadableStream    // [..'a'..'b'..]

const unsub = subscribeEx({
  next: ({value, index, emitter, emitterIndex, event}) => console.log(`value ${value} from stream ${emitterIndex}`)
})(
  stream0,
  stream1
)
```

### `subscribeReadable`
`({ next, error?, complete? }: IObserver) => (...streams: ReadableStream[]) => UnsubscribeFn`
```ts
import { subscribeReadable } from 'node-streams'

// we have the following streams
declare var stream0: ReadableStream    // [1..2..3]
declare var stream1: ReadableStream    // [..'a'..'b'..]

const unsub = subscribeReadable({
  next: console.log                    // [1..'a'..2..3..'b'..]
})(
  stream0,
  stream1
)
```

### `subscribeReadableEx`
`({ next, error?, complete? }: IObserverEx) => (...streams: ReadableStream[]) => UnsubscribeFn`
```ts
import { subscribeReadableEx } from 'node-streams'

// we have the following streams
declare var stream0: ReadableStream    // [1..2..3]
declare var stream1: ReadableStream    // [..'a'..'b'..]

const unsub = subscribeReadableEx({
  next: ({value, index, emitter, emitterIndex, event}) => console.log(`value ${value} from stream ${emitterIndex}`)
})(
  stream0,
  stream1
)
```
