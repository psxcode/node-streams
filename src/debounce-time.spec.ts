import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import debounceTime from './debounce-time'

const log = debug('producer')

xdescribe('[debounceTime]', () => {
  transformTest(
    makeNumbers(4),
    readable({ delayMs: 0, log })({ objectMode: true }),
    writable({})({ objectMode: true }),
    () => debounceTime({ objectMode: true })(30))
})
