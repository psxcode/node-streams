import { expect } from 'chai'
import { dataConsumer, makeNumbers, readable, readableTest } from 'node-stream-test'
import combine from './combine'
import debug from 'debug'

let i = 0
const prodLog = () => debug(`prod${i++}`)
const consLog = debug('cons')

xdescribe('[ combine ]', () => {
  readableTest(
    makeNumbers(4),
    (data) => {
      const s1 = readable({ delayMs: 12, log: prodLog() })({ objectMode: true })(data)
      const s2 = readable({ delayMs: 10, log: prodLog() })({ objectMode: true })(data)
      const s3 = readable({ delayMs: 8, log: prodLog() })({ objectMode: true })(data)
      return combine({ objectMode: true })(s1, s2, s3)
    },
    dataConsumer(consLog),
    (data, spy) => {
      expect(spy.data().length).eq(15)
    })
})
