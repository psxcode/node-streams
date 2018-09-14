import { expect } from 'chai'
import { dataConsumer, readable, readableTest } from 'node-stream-test'
import debug from 'debug'
import startWith from './start-with'

let i = 0
const prodLog = () => debug(`prod${i++}`)
const consLog = debug('cons')

xdescribe('[ concat ]', () => {
  readableTest([5, 6, 7, 8, 9],
    (data) => {
      const s1 = readable({ delayMs: 50, log: prodLog() })({ objectMode: true })(data)
      return startWith({ objectMode: true })(0, 1, 2, 3, 4)(s1)
    },
    dataConsumer(consLog),
    (data, spy) => {
      expect(spy.data()).deep.eq([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
})
