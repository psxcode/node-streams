import { expect } from 'chai'
import { dataConsumer, makeStrings, readableTest } from 'node-stream-test'
import debug from 'debug'
import empty from './empty'

const log = debug('consumer')

xdescribe('[ empty ]', () => {
  readableTest(
    makeStrings(4),
    empty({ objectMode: true }),
    dataConsumer({ log }),
    (data, spy) => {
      expect(spy.callCount()).eq(0)
    })
})
