import { expect } from 'chai'
import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import filter from '../src/filter'

const log = debug('producer')

const isEven = (value: number) => value % 2 === 0

describe('[ filter ]', () => {
  transformTest(
    makeNumbers(8),
    readable({ log })({ objectMode: true }),
    writable({})({ objectMode: true }),
    () => filter({ objectMode: true })(isEven),
    (data, spy) => {
      expect(spy.data()).deep.eq(Array.from(data).filter(isEven))
    }
  )
})
