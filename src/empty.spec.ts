import { expect } from 'chai'
import { dataConsumer, makeStrings, readableTest } from 'node-stream-test'
import empty from './empty'
import debug from 'debug'

const log = debug('consumer')

xdescribe('[ empty ]', () => {
  readableTest(
    makeStrings(4),
    empty({ objectMode: true }),
    dataConsumer(log),
    (data, spy) => {
      expect(spy.callCount()).eq(0)
    })
})
