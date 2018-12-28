import { expect } from 'chai'
import {
  dataConsumer,
  makeNumbers,
  readable,
  readableTest
} from 'node-stream-test'
import debug from 'debug'
import withLatest from './with-latest'

let i = 0
const prodLog = () => debug(`prod${i++}`)
const consLog = debug('cons')

describe('[ withLatest ]', () => {
  readableTest(
    makeNumbers(8),
    (data) => {
      const s1 = readable({ delayMs: 5, log: prodLog() })({ objectMode: true })(data)
      const s2 = readable({ delayMs: 10, log: prodLog() })({ objectMode: true })(data)
      const s3 = readable({ delayMs: 50, eager: true, log: prodLog() })({ objectMode: true })(data)
      return withLatest({ objectMode: true })(s2, s3)(s1)
    },
    dataConsumer({ log: consLog }),
    (data, spy) => {
      expect(spy.data().length).eq(Array.from(data).length)
    })
})
