import { expect } from 'chai'
import { dataConsumer, makeNumbers, readableTest } from 'node-stream-test'
import debug from 'debug'
import from from '../src/from'

const log = debug('consumer')

describe('[ from ]', () => {
  readableTest(
    makeNumbers(8),
    from({ objectMode: true }),
    dataConsumer({ log }),
    (data, spy) => {
      expect(Array.from(data).length).eq(spy.callCount())
    }
  )
})