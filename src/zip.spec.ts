import { expect } from 'chai'
import { dataConsumer, makeNumbers, readable, readableTest } from 'node-stream-test'
import debug from 'debug'
import zip from './zip'

let i = 0
const prodLog = () => debug(`prod${i++}`)
const consLog = debug('cons')

xdescribe('[ zip ]', () => {
  readableTest(
    makeNumbers(5),
    (data) => {
      const s1 = readable({ delayMs: 30, log: prodLog() })({ objectMode: true })(data)
      const s2 = readable({ delayMs: 10, log: prodLog() })({ objectMode: true })([0, 1, 2, 3, 4, 5, 6])
      return zip({ objectMode: true })(s1, s2)
    },
    dataConsumer({ log: consLog }),
    (data, spy) => {
      expect(spy.data()).deep.eq([[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]])
    })
})
