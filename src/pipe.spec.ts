import { expect } from 'chai'
import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import pipe from './pipe'
import filter from './filter'
import map from './map'
import first from './first'

const log = debug('producer')

const isEqual = (value: number) => (arg: number) => value === arg
const multiply = (multiplier: number) => (value: number) => value * multiplier

xdescribe('[ pipe ]', () => {
  transformTest<number>(makeNumbers(4),
    (data) => readable({ log })({ objectMode: true })(data),
    (spy) => writable({})({ objectMode: true })(spy),
    () => pipe(
      filter({ objectMode: true })(isEqual(10)),
      first({ objectMode: true })(),
      map({ objectMode: true })(multiply(2))
    ),
    (data, spy) => {
      expect(spy.callCount()).eq(1)
      expect(spy.data()).deep.eq([20])
    })
})
