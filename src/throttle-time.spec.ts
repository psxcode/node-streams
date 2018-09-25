import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import throttleTime from './throttle-time'

const log = debug('producer')

xdescribe('[ throttleTime ]', () => {
  transformTest<number>(
    makeNumbers(8),
    readable({ delayMs: 0, log })({ objectMode: true }),
    writable({})({ objectMode: true }),
    () => throttleTime({ objectMode: true })(30))
})
