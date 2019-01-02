import { expect } from 'chai'
import { dataConsumer, makeNumbers, readable, readableTest } from 'node-stream-test'
import debug from 'debug'
import concat from '../src/concat'

let i = 0
const prodLog = () => debug(`prod${i++}`)
const consLog = debug('cons')

describe('[ concat ]', () => {
  readableTest(
    makeNumbers(4),
    (data) => {
      const s1 = readable({ delayMs: 50, log: prodLog() })({ objectMode: true })(data)
      const s2 = readable({ delayMs: 10, log: prodLog() })({ objectMode: true })(data)

      return concat({ objectMode: true })(s1, s2)
    },
    dataConsumer({ log: consLog }),
    (data, spy) => {
      expect(spy.data()).deep.eq([0, 1, 2, 3, 4, 0, 1, 2, 3, 4])
    }
  )
})