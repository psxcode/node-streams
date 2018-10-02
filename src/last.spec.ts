import { expect } from 'chai'
import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import filter from './filter'
import last from './last'
import map from './map'

const log = debug('producer')

const isEqual = (value: number) => (arg: number) => value === arg
const multiply = (multiplier: number) => (value: number) => value * multiplier

xdescribe('[ last ]', () => {
  transformTest(
    makeNumbers(4),
    readable({ log })({ objectMode: true }),
    writable({})({ objectMode: true }),
    () => [
      filter({ objectMode: true })(isEqual(10)),
      last({ objectMode: true }),
      map({ objectMode: true })(multiply(2))
    ],
    (data, spy) => {
      expect(spy.data()).deep.eq([20])
    })
})
