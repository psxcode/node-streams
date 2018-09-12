import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import bufferTime from './buffer-time'
import debug from 'debug'

const log = debug('producer')

xdescribe('[ bufferTime ]', () => {
  transformTest(
    makeNumbers(4),
    data => readable({ delayMs: 5, log })({ objectMode: true })(data),
    spy => writable({})({ objectMode: true })(spy),
    () => bufferTime({ objectMode: true })(30)
  )
})
