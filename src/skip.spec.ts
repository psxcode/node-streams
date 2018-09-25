import { expect } from 'chai'
import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import skip from './skip'

const log = debug('producer')

xdescribe('[ skip ]', () => {
  transformTest<number>(
    makeNumbers(8),
    readable({ log })({ objectMode: true }),
    writable({})({ objectMode: true }),
    () => skip({ objectMode: true })(5),
    (data, spy) => {
      expect(spy.data()).deep.eq(Array.from(data).slice(5))
    })
})
