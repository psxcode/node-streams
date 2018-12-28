import { expect } from 'chai'
import { readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import filter from './filter'
import first from './first'
import pluck from './pluck'
import map from './map'

const log = debug('producer')

const isEqual = (value: number) => (arg: number) => value === arg
const multiply = (multiplier: number) => (value: number) => value * multiplier
const makeNumbers = (length: number): Iterable<{ value: number }> => ({
  * [Symbol.iterator] () {
    for (let i = 0; i < length; ++i) {
      yield { value: i }
    }
  }
})

describe('[ pluck ]', () => {
  transformTest(
    makeNumbers(8),
    readable({ log })({ objectMode: true }),
    writable({})({ objectMode: true }),
    () => [
      pluck({ objectMode: true })('value'),
      filter({ objectMode: true })(isEqual(10)),
      first({ objectMode: true }),
      map({ objectMode: true })(multiply(2))
    ],
    (data, spy) => {
      expect(spy.callCount()).eq(1)
      expect(spy.data()).deep.eq([20])
    })
})
