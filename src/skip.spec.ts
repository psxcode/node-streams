import { expect } from 'chai'
import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import skip from './skip'
import debug from 'debug'

const log = debug('producer')

xdescribe('[ skip ]', () => {
  transformTest<number>(makeNumbers(8),
    (data) => readable({ log })({ objectMode: true })(data),
    (spy) => writable({})({ objectMode: true })(spy),
    () => skip({ objectMode: true })(5),
    (data, spy) => {
      expect(spy.data()).deep.eq(Array.from(data).slice(5))
    })
})
