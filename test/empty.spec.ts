import { expect } from 'chai'
import { dataConsumer, makeStrings, readableTest } from 'node-stream-test'
import debug from 'debug'
import empty from '../src/empty'

const log = debug('consumer')

describe('[ empty ]', () => {
  readableTest(
    makeStrings(4),
    () => empty({ objectMode: true }),
    dataConsumer({ log }),
    (data, spy) => {
      expect(spy.callCount()).eq(0)
    }
  )
})
