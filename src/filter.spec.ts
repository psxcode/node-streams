import { expect } from 'chai'
import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import filter from './filter'

const log = debug('producer')

const isEven = (value: number) => value % 2 === 0

xdescribe('[ filter ]', () => {
  transformTest(
    makeNumbers(8),
    (data) => readable({ log })({ objectMode: true })(data),
    (spy) => writable({})({ objectMode: true })(spy),
    () => filter({ objectMode: true })(isEven),
    (data, spy) => {
      expect(spy.data()).deep.eq(Array.from(data).filter(isEven))
    })
})
