import { expect } from 'chai'
import * as sinon from 'sinon'
import { makeNumbers, readable, waitForEvents } from 'node-stream-test'
import { waitTimePromise as wait } from '@psxcode/wait'
import debug from 'debug'
import subscribe from './subscribe'

let i = 0
const prodLog = () => debug(`prod${i++}`)
const consLog = debug('cons')

describe('[ subscribe ]', () => {
  xit('should work with single stream', async () => {
    const d1 = makeNumbers(8)
    const s1 = readable({ log: prodLog() })({ objectMode: true })(d1)
    const receivedData: number[] = []
    const spy = sinon.spy((data: any) => receivedData.push(data))

    await wait(100)
    subscribe({ next: spy })(s1)

    await waitForEvents('end', 'error')(s1)
    await wait(20)
    expect(receivedData).deep.eq(Array.from(d1))
  })

  xit('should work with multiple streams', async () => {
    const d1 = [0, 1, 2, 3, 4]
    const d2 = makeNumbers(5)
    const s1 = readable({ delayMs: 10, log: prodLog() })({ objectMode: true })(d1)
    const s2 = readable({ delayMs: 15, log: prodLog() })({ objectMode: true })(d2)
    const receivedData: number[] = []
    const spy = sinon.spy((data: any) => receivedData.push(data))

    await wait(100)
    subscribe({ next: spy })(s1, s2)

    await waitForEvents('end', 'error')(s2)
    await wait(20)
    expect(receivedData.length).eq(10)
  })

  xit('should work with complete', async () => {
    const d1 = [0, 1, 2, 3, 4]
    const d2 = makeNumbers(5)
    const s1 = readable({ delayMs: 10, log: prodLog() })({ objectMode: true })(d1)
    const s2 = readable({ delayMs: 15, log: prodLog() })({ objectMode: true })(d2)
    const receivedData: number[] = []
    const spy = sinon.spy((data: any) => receivedData.push(data))
    const completeSpy = sinon.spy()

    await wait(100)
    subscribe({ next: spy, complete: completeSpy })(s1, s2)

    await waitForEvents('end', 'error')(s2)
    await wait(20)
    expect(receivedData.length).eq(10)
    sinon.assert.calledOnce(completeSpy)
  })

  xit('should work with unsubscribe', async () => {
    const d1 = makeNumbers(8)
    const s1 = readable({ delayMs: 10, log: prodLog() })({ objectMode: true })(d1)
    const receivedData: number[] = []
    const spy = sinon.spy((data: any) => receivedData.push(data))
    const completeSpy = sinon.spy()

    await wait(100)
    const unsub = subscribe({ next: spy, complete: completeSpy })(s1)

    await wait(30)
    unsub()

    await waitForEvents('end', 'error')(s1)
    await wait(20)
    expect(receivedData.length).not.eq(Array.from(d1).length)
    sinon.assert.notCalled(completeSpy)
  })
})
