import { expect } from 'chai'
import { dataConsumer, makeNumbers, readableTest } from 'node-stream-test'
import from from './from'
import debug from 'debug'

const log = debug('consumer')

xdescribe('[ from ]', () => {
  readableTest(
    makeNumbers(8),
    from({ objectMode: true }),
    dataConsumer(log),
    (data, spy) => {
      expect(Array.from(data).length).eq(spy.callCount())
    })
})
