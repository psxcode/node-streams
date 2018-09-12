import { expect } from 'chai'
import { dataConsumer, makeNumbers, readableTest } from 'node-stream-test'
import of from './of'
import debug from 'debug'

const log = debug('producer')

xdescribe('[ of ]', () => {
  readableTest<number>(
    makeNumbers(4),
    (data) => of({ objectMode: true })(...data),
    (readable, sink) => dataConsumer(log)(readable, sink),
    (data, spy) => {
      expect(spy.data()).deep.eq(Array.from(data))
    })
})
