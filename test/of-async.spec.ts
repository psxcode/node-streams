import { expect } from 'chai'
import { dataConsumer, makeNumbers, readableTest } from 'node-stream-test'
import debug from 'debug'
import ofAsync from '../src/of-async'

const log = debug('producer')

describe('[ ofAsync ]', () => {
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
    dataConsumer({ log }),
    (data, spy) => {
      expect(spy.data()).deep.eq(Array.from(data))
    }
  )
})
