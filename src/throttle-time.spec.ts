import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import throttleTime from './throttle-time'

const log = debug('producer')

xdescribe('[ throttleTime ]', () => {
  transformTest<number>(makeNumbers(8),
    (data) => readable({ delayMs: 0, log })({ objectMode: true })(data),
    (spy) => writable({})({ objectMode: true })(spy),
    () => throttleTime({ objectMode: true })(30))
})
