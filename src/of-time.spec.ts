import { expect } from 'chai'
import { dataConsumer, makeNumbers, readableTest } from 'node-stream-test'
import debug from 'debug'
import ofTime from './of-time'

const log = debug('producer')

describe('[ ofTime ]', () => {
  readableTest<number>(
    makeNumbers(4),
    (data) => ofTime({ objectMode: true })(30)(...data),
    dataConsumer({ log }),
    (data, spy) => {
      expect(spy.data()).deep.eq(Array.from(data))
    })
})
