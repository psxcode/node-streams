import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import bufferTime from '../src/buffer-time'

const log = debug('producer')

describe('[ bufferTime ]', () => {
  transformTest(
    makeNumbers(4),
    readable({ delayMs: 5, log })({ objectMode: true }),
    writable({})({ objectMode: true }),
    () => bufferTime({ objectMode: true })(30)
  )
})
