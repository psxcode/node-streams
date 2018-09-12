import { expect } from 'chai'
import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import reduce from './reduce'
import debug from 'debug'

const log = debug('producer')

const addAll = (acc = 0, value: number) => acc + value

xdescribe('[ reduce ]', () => {
  transformTest<number>(makeNumbers(8),
    (data) => readable({ log })({ objectMode: true })(data),
    (spy) => writable({})({ objectMode: true })(spy),
    () => reduce({ objectMode: true })(addAll),
    (data, spy) => {
      expect(spy.data()).deep.eq([Array.from(data).reduce(addAll)])
    })
})
