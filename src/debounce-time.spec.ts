import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debounceTime from './debounce-time'
import debug from 'debug'

const log = debug('producer')

xdescribe('[debounceTime]', () => {
  transformTest(
    makeNumbers(4),
    (data) => readable({ delayMs: 0, log })({ objectMode: true })(data),
    (spy) => writable({})({ objectMode: true })(spy),
    () => debounceTime({ objectMode: true })(30))
})
