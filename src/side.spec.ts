import { expect } from 'chai'
import {
  makeNumbers,
  makeStrings,
  readable,
  transformTest,
  writable
} from 'node-stream-test'
import side from './side'
import debug from 'debug'

const log = debug('producer')

const multiply = (multiplier: number) => (value: number) => value * multiplier

xdescribe('[ side ]', () => {
  transformTest<string>(makeStrings(8),
    (data) => readable({ log })({ encoding: 'utf8' })(data),
    (spy) => writable({})({ decodeStrings: false })(spy),
    () => side({ objectMode: true })(x => x),
    (data, spy) => {
      expect(spy.callCount()).eq(Array.from(data).length)
    })

  transformTest<number>(makeNumbers(4),
    (data) => readable({ log })({ objectMode: true })(data),
    (spy) => writable({})({ objectMode: true })(spy),
    () => side({ objectMode: true })(multiply(2)),
    (data, spy) => {
      expect(spy.data()).deep.eq(Array.from(data))
    })
})
