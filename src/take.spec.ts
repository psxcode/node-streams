import { expect } from 'chai'
import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import take from './take'

const log = debug('producer')

describe.skip('[ take ]', () => {
  transformTest<number>(makeNumbers(8),
    (data) => readable({ log })({ objectMode: true })(data),
    (spy) => writable({})({ objectMode: true })(spy),
    () => take({ objectMode: true })(5),
    (data, spy) => {
      expect(spy.data()).deep.eq(Array.from(data).slice(0, 5))
    })
})
