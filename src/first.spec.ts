import { expect } from 'chai'
import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import filter from './filter'
import first from './first'
import map from './map'

const log = debug('producer')

const isEqual = (value: number) => (arg: number) => value === arg
const multiply = (multiplier: number) => (value: number) => value * multiplier

describe('[ first ]', () => {
  transformTest(
    makeNumbers(8),
    readable({ log })({ objectMode: true }),
    writable({})({ objectMode: true }),
    () => first({ objectMode: true }),
    (data, spy) => {
      expect(spy.callCount()).eq(1)
      expect(spy.data()).deep.eq(Array.from(data).slice(0, 1))
    })

  transformTest(
    makeNumbers(4),
    readable({ log })({ objectMode: true }),
    writable({})({ objectMode: true }),
    () => [
      filter({ objectMode: true })(isEqual(10)),
      first({ objectMode: true }),
      map({ objectMode: true })(multiply(2))
    ],
    (data, spy) => {
      expect(spy.callCount()).eq(1)
      expect(spy.data()).deep.eq([20])
    })
})
