import { expect } from 'chai'
import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import pipe from '../src/pipe'
import filter from '../src/filter'
import map from '../src/map'
import first from '../src/first'

const log = debug('producer')

const isEqual = (value: number) => (arg: number) => value === arg
const multiply = (multiplier: number) => (value: number) => value * multiplier

describe('[ pipe ]', () => {
  transformTest<number>(
    makeNumbers(4),
    readable({ log })({ objectMode: true }),
    writable({})({ objectMode: true }),
    () => pipe(
      filter({ objectMode: true })(isEqual(10)),
      first({ objectMode: true }),
      map({ objectMode: true })(multiply(2))
    ),
    (data, spy) => {
      expect(spy.callCount()).eq(1)
      expect(spy.data()).deep.eq([20])
    }
  )
})
