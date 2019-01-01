import { expect } from 'chai'
import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import reduce from '../src/reduce'

const log = debug('producer')

const addAll = (acc = 0, value: number) => acc + value

describe('[ reduce ]', () => {
  transformTest<number>(
    makeNumbers(8),
    readable({ log })({ objectMode: true }),
    writable({})({ objectMode: true }),
    () => reduce({ objectMode: true })(addAll),
    (data, spy) => {
      expect(spy.data()).deep.eq([Array.from(data).reduce(addAll)])
    }
  )
})
