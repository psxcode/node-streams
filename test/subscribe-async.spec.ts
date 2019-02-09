import { expect } from 'chai'
import { describe, it } from 'mocha'
import fn from 'test-fn'
import { readable } from 'node-stream-test'
import debug from 'debug'
import { waitTimePromise as wait } from '@psxcode/wait'
import subscribeAsync from '../src/subscribe-async'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'

let i = 0
const readableLog = () => debug(`ns:readable:${i++}`)
const sinkLog = () => debug(`ns:sink:${i++}`)
const makeWait = (ms: number) => {
  const log = sinkLog()

  return (chunk) => {
    log(chunk)

    return wait(ms)
  }
}

describe('[ subscribeAsync ]', () => {
  it('should work with single stream', async () => {
    const d1 = makeNumbers(4)
    const spy = fn(makeWait(10))
    const s1 = readable({ eager: true, log: readableLog() })({ objectMode: true })(d1)
    subscribeAsync({ next: spy })(s1)

    await finished(s1)

    expect(spy.calls).deep.eq([
      [0], [1], [2], [3],
    ])
    expect(numEvents(s1)).eq(0)
  })

  it('should work with multiple streams', async () => {
    const d1 = [0, 1, 2, 3]
    const d2 = makeNumbers(4)
    const spy = fn(makeWait(0))
    const s1 = readable({ eager: false, delayMs: 20, log: readableLog() })({ objectMode: true })(d1)
    const s2 = readable({ eager: false, delayMs: 20, log: readableLog() })({ objectMode: true })(d2)
    subscribeAsync({ next: spy })(s1, s2)

    await finished(s1, s2)

    expect(spy.calls).deep.eq([
      [0], [0], [1], [1], [2], [2], [3], [3],
    ])
    expect(numEvents(s1, s2)).eq(0)
  })

  it('should work with complete', async () => {
    const d1 = [0, 1, 2, 3]
    const d2 = makeNumbers(4)
    const spy = fn(makeWait(10))
    const completeSpy = fn()
    const s1 = readable({ eager: true, delayMs: 0, log: readableLog() })({ objectMode: true })(d1)
    const s2 = readable({ eager: true, delayMs: 0, log: readableLog() })({ objectMode: true })(d2)
    subscribeAsync({ next: spy, complete: completeSpy })(s1, s2)

    await finished(s1, s2)

    expect(spy.calls).deep.eq([
      [0], [1], [2], [3], [0], [1], [2], [3],
    ])
    expect(completeSpy.calls).deep.eq([
      [],
    ])
    expect(numEvents(s1, s2)).eq(0)
  })

  it('should work with unsubscribe', async () => {
    const d1 = makeNumbers(4)
    const spy = fn(makeWait(10))
    const completeSpy = fn()
    const s1 = readable({ eager: true, delayMs: 10, log: readableLog() })({ objectMode: true })(d1)
    const unsub = subscribeAsync({ next: spy, complete: completeSpy })(s1)

    unsub()

    await finished(s1)

    expect(spy.calls).deep.eq([])
    expect(completeSpy.calls).deep.eq([])
    expect(numEvents(s1)).eq(0)
  })

  it('error handling - error break', async () => {
    const d1 = makeNumbers(4)
    const spy = fn(makeWait(10))
    const errorSpy = fn(debug('ns:error'))
    const completeSpy = fn(debug('ns:complete') as any)
    const s1 = readable({ eager: true, delayMs: 10, log: readableLog(), errorAtStep: 1, continueOnError: false })({ objectMode: true })(d1)
    subscribeAsync({ next: spy, error: errorSpy, complete: completeSpy })(s1)

    await finished(s1)

    expect(spy.calls).deep.eq([
      [0],
    ])
    expect(errorSpy.errors).deep.eq([
      ['error at 1'],
    ])
    expect(completeSpy.calls).deep.eq([
      [],
    ])
    expect(numEvents(s1)).eq(0)
  })

  it('error handling - error continue', async () => {
    const d1 = makeNumbers(4)
    const spy = fn(makeWait(10))
    const errorSpy = fn(debug('ns:error'))
    const completeSpy = fn(debug('ns:complete') as any)
    const s1 = readable({ eager: true, delayMs: 10, log: readableLog(), errorAtStep: 1, continueOnError: true })({ objectMode: true })(d1)
    subscribeAsync({ next: spy, error: errorSpy, complete: completeSpy })(s1)

    await finished(s1)

    expect(spy.calls).deep.eq([
      [0], [1], [2], [3],
    ])
    expect(errorSpy.errors).deep.eq([
      ['error at 1'],
    ])
    expect(completeSpy.calls).deep.eq([
      [],
    ])
    expect(numEvents(s1)).eq(0)
  })
})
