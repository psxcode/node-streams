import { expect } from 'chai'
import { dataConsumer, makeNumbers, readableTest } from 'node-stream-test'
import ofAsync from './of-async'
import debug from 'debug'

const log = debug('producer')

xdescribe('[ ofAsync ]', () => {
  const interval = (next: () => void) => {
    console.log('subscribe')
    const id = setTimeout(next, 30)
    return () => {
      console.log('clear')
      clearTimeout(id)
    }
  }
  readableTest<number>(
    makeNumbers(4),
    (data) => ofAsync({ objectMode: true })(interval)(...data),
    (readable, sink) => dataConsumer(log)(readable, sink),
    (data, spy) => {
      expect(spy.data()).deep.eq(Array.from(data))
    })
})
