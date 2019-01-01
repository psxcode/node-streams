import { expect } from 'chai'
import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import scan from '../src/scan'

const log = debug('producer')

const addAll = (acc = 0, value: number) => acc + value

describe('[ scan ]', () => {
  transformTest<number>(
    makeNumbers(8),
    readable({ log })({ objectMode: true }),
    writable({})({ objectMode: true }),
    () => scan({ objectMode: true })(addAll),
    (data, spy) => {
      expect(spy.data()).deep.eq(
        Array.from(data).reduce((acc: number[], val, i) => [...acc, i > 0 ? val + acc[i - 1] : val], [])
      )
    }
  )
})
