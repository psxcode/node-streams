import { expect } from 'chai'
import { readable, transformTest, writable } from 'node-stream-test'
import distinct from './distinct'
import debug from 'debug'

const log = debug('producer')

xdescribe('[ distinct ]', () => {
  const isEqual = <T> (a: T, b: T) => a === b

  transformTest<number>(
    [0, 1, 2, 2, 2, 3, 4, 4, 5, 5, 6, 7, 7, 8, 9, 9, 9],
    (data) => readable({ delayMs: 30, log })({ objectMode: true })(data),
    (spy) => writable({})({ objectMode: true })(spy),
    () => distinct({ objectMode: true })(isEqual),
    (data, spy) => {
      expect(spy.data()).deep.eq([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
})
