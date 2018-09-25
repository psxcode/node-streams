import { expect } from 'chai'
import debug from 'debug'
import { waitTimePromise } from '@psxcode/wait'
import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import delay from './delay'

const log = debug('producer')

xdescribe('[ delay ]', () => {
  transformTest<number>(
    makeNumbers(8),
    readable({ delayMs: 30, log })({ objectMode: true }),
    writable({})({ objectMode: true }),
    () => delay({ objectMode: true })(waitTimePromise, Date.now)(1000),
    (data, spy) => {
      expect(spy.data()).deep.eq(Array.from(data))
    })
})
