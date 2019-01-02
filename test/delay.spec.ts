import { expect } from 'chai'
import debug from 'debug'
import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import { delayRaw } from '../src/delay'

const log = debug('producer')

describe('[ delay ]', () => {
  transformTest<number>(
    makeNumbers(8),
    readable({ delayMs: 30, log })({ objectMode: true }),
    writable({})({ objectMode: true }),
    () => delayRaw()({ objectMode: true })(1000),
    (data, spy) => {
      expect(spy.data()).deep.eq(Array.from(data))
    }
  )
})