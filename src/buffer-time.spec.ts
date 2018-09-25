import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import bufferTime from './buffer-time'

const log = debug('producer')

xdescribe('[ bufferTime ]', () => {
  transformTest(
    makeNumbers(4),
    readable({ delayMs: 5, log })({ objectMode: true }),
    writable({})({ objectMode: true }),
    () => bufferTime({ objectMode: true })(30)
  )
})
