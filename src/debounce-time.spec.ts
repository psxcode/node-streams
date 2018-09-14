import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import debounceTime from './debounce-time'

const log = debug('producer')

xdescribe('[debounceTime]', () => {
  transformTest(
    makeNumbers(4),
    (data) => readable({ delayMs: 0, log })({ objectMode: true })(data),
    (spy) => writable({})({ objectMode: true })(spy),
    () => debounceTime({ objectMode: true })(30))
})
