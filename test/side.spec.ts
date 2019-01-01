import { expect } from 'chai'
import { makeNumbers, makeStrings, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import side from '../src/side'

const log = debug('producer')

const multiply = (multiplier: number) => (value: number) => value * multiplier

describe('[ side ]', () => {
  transformTest<string>(
    makeStrings(8),
    readable({ log })({ encoding: 'utf8' }),
    writable({})({ decodeStrings: false }),
    () => side({ objectMode: true })((x) => x),
    (data, spy) => {
      expect(spy.callCount()).eq(Array.from(data).length)
    }
  )

  transformTest<number>(
    makeNumbers(4),
    readable({ log })({ objectMode: true }),
    writable({})({ objectMode: true }),
    () => side({ objectMode: true })(multiply(2)),
    (data, spy) => {
      expect(spy.data()).deep.eq(Array.from(data))
    }
  )
})
