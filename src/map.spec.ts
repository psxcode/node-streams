import { expect } from 'chai'
import { makeNumbers, makeStrings, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import map from './map'

const log = debug('producer')

const multiply = (multiplier: number) => (value: number) => value * multiplier
const identity = <T> (x: T) => x

describe('[ map ]', () => {
  transformTest(
    makeStrings(6),
    readable({ log })({ encoding: 'utf8' }),
    writable({})({ decodeStrings: false }),
    () => map({ objectMode: true })(identity),
    (data, spy) => {
      expect(spy.callCount()).eq(Array.from(data).length)
    })

  transformTest(
    makeNumbers(4),
    readable({ log })({ objectMode: true }),
    writable({})({ objectMode: true }),
    () => map({ objectMode: true })(multiply(2)),
    (data, spy) => {
      expect(spy.data()).deep.eq(Array.from(data).map(multiply(2)))
    })
})
