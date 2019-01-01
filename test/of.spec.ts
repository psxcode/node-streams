import { expect } from 'chai'
import { dataConsumer, makeNumbers, readableTest } from 'node-stream-test'
import debug from 'debug'
import of from '../src/of'

const log = debug('producer')

describe('[ of ]', () => {
  readableTest<number>(
    makeNumbers(4),
    (data) => of({ objectMode: true })(...data),
    dataConsumer({ log }),
    (data, spy) => {
      expect(spy.data()).deep.eq(Array.from(data))
    }
  )
})
