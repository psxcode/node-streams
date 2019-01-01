import { expect } from 'chai'
import { dataConsumer, readable, readableTest } from 'node-stream-test'
import debug from 'debug'
import merge from '../src/merge'

let i = 0
const prodLog = () => debug(`prod${i++}`)
const consLog = debug('cons')

describe('[ merge ]', () => {
  readableTest(
    [0, 1, 2, 3, 4],
    (data) => {
      const s1 = readable({ delayMs: 50, log: prodLog() })({ objectMode: true })(data)
      const s2 = readable({ delayMs: 10, log: prodLog() })({ objectMode: true })(data)

      return merge({ objectMode: true })(s1, s2)
    },
    dataConsumer({ log: consLog }),
    (data, spy) => {
      expect(spy.data().length).eq(10)
    }
  )
})
