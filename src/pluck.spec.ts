import { expect } from 'chai'
import { readable, transformTest, writable } from 'node-stream-test'
import filter from './filter'
import first from './first'
import pluck from './pluck'
import map from './map'
import debug from 'debug'

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

xdescribe('[ pluck ]', () => {
  transformTest(makeNumbers(8),
    (data) => readable({ log })({ objectMode: true })(data),
    (spy) => writable({})({ objectMode: true })(spy),
    () => [
      pluck({ objectMode: true })('value'),
      filter({ objectMode: true })(isEqual(10)),
      first({ objectMode: true })(),
      map({ objectMode: true })(multiply(2))
    ],
    (data, spy) => {
      expect(spy.callCount()).eq(1)
      expect(spy.data()).deep.eq([20])
    })
})
