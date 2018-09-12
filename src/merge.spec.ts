import { expect } from 'chai'
import { dataConsumer, readable, readableTest } from 'node-stream-test'
import merge from './merge'
import debug from 'debug'

let i = 0
const prodLog = () => debug(`prod${i++}`)
const consLog = debug('cons')

xdescribe('[ merge ]', () => {
  readableTest(
    [0, 1, 2, 3, 4],
    (data) => {
      const s1 = readable({ delayMs: 50, log: prodLog() })({ objectMode: true })(data)
      const s2 = readable({ delayMs: 10, log: prodLog() })({ objectMode: true })(data)
      return merge({ objectMode: true })(s1, s2)
    },
    dataConsumer(consLog),
    (data, spy) => {
      expect(spy.data().length).eq(10)
    })
})
