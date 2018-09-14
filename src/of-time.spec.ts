import { expect } from 'chai'
import { dataConsumer, makeNumbers, readableTest } from 'node-stream-test'
import debug from 'debug'
import ofTime from './of-time'

const log = debug('producer')

xdescribe('[ ofTime ]', () => {
  readableTest<number>(
    makeNumbers(4),
    (data) => ofTime({ objectMode: true })(30)(...data),
    (readable, sink) => dataConsumer(log)(readable, sink),
    (data, spy) => {
      expect(spy.data()).deep.eq(Array.from(data))
    })
})
