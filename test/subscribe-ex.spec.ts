import { expect } from 'chai'
import { createSpy, getSpyCalls } from 'spyfn'
import { makeNumbers, readable, waitForEvents } from 'node-stream-test'
import { waitTimePromise as wait } from '@psxcode/wait'
import debug from 'debug'
import subscribeEx from '../src/subscribe-ex'

let i = 0
const prodLog = () => debug(`prod${i++}`)

describe('[ subscribeEx ]', () => {
  xit('should work with single stream', async () => {
    const data = [0, 1]
    const stream = readable({ log: prodLog() })({ objectMode: true })(data)
    const spy = createSpy(() => {})

    await wait(100)
    subscribeEx({ next: spy })(stream)

    await waitForEvents('end', 'error')(stream)
    await wait(20)
    expect(getSpyCalls(spy)).deep.eq([])
  })

  xit('should work with multiple streams', async () => {
    const d1 = [0, 1, 2, 3, 4]
    const d2 = makeNumbers(8)
    const s1 = readable({ delayMs: 10, log: prodLog() })({ objectMode: true })(d1)
    const s2 = readable({ delayMs: 15, log: prodLog() })({ objectMode: true })(d2)
    const spy = createSpy(() => {})

    await wait(100)
    subscribeEx({ next: spy })(s1, s2)

    await waitForEvents('end', 'error')(s1)
    await wait(20)
    expect(getSpyCalls(spy)).eq([])
  })

  xit('should work with complete', async () => {
    const d1 = [0, 1, 2, 3, 4]
    const d2 = makeNumbers(8)
    const s1 = readable({ delayMs: 10, log: prodLog() })({ objectMode: true })(d1)
    const s2 = readable({ delayMs: 15, log: prodLog() })({ objectMode: true })(d2)
    const spy = createSpy(() => {})
    const completeSpy = createSpy(() => {})

    subscribeEx({ next: spy, complete: completeSpy })(s1, s2)

    await waitForEvents('end', 'error')(s1)
    await wait(0)
    expect(getSpyCalls(spy)).deep.eq([])
    expect(getSpyCalls(completeSpy)).deep.eq([[]])
  })

  xit('should work with unsubscribe', async () => {
    const d1 = makeNumbers(8)
    const s1 = readable({ delayMs: 10, log: prodLog() })({ objectMode: true })(d1)
    const receivedData: number[] = []
    const spy = createSpy(() => {})
    const completeSpy = createSpy(() => {})

    const unsub = subscribeEx({ next: spy, complete: completeSpy })(s1)

    await wait(0)

    unsub()

    await waitForEvents('end', 'error')(s1)
    await wait(0)
    expect(getSpyCalls(spy)).deep.eq([])
    expect(getSpyCalls(completeSpy)).deep.eq([[]])
  })
})
