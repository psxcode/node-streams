import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import debounceTime from '../src/debounce-time'

const log = debug('producer')

describe('[debounceTime]', () => {
  transformTest(
    makeNumbers(4),
    readable({ delayMs: 0, log })({ objectMode: true }),
    writable({})({ objectMode: true }),
    () => debounceTime({ objectMode: true })(30)
  )
})
