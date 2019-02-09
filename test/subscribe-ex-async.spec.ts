import { expect } from 'chai'
import { describe, it } from 'mocha'
import fn from 'test-fn'
import { readable } from 'node-stream-test'
import debug from 'debug'
import { waitTimePromise as wait } from '@psxcode/wait'
import subscribeExAsync from '../src/subscribe-ex-async'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'
import errorMessage from './error-message'

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

describe('[ subscribeExAsync ]', () => {
  it('should work with single stream', async () => {
    const data = [0, 1]
    const spy = fn(makeWait(0))
    const s1 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(data)
    subscribeExAsync({ next: spy })(s1)

    await finished(s1)

    expect(spy.calls).deep.eq([
      [{ value: 0, index: 0, event: 'data', emitter: s1, emitterIndex: 0 }],
      [{ value: 1, index: 1, event: 'data', emitter: s1, emitterIndex: 0 }],
    ])
    expect(numEvents(s1)).eq(0)
  })

  it('should work with multiple streams', async () => {
    const d1 = [0, 1, 2, 3]
    const d2 = makeNumbers(4)
    const spy = fn(makeWait(10))
    const errorSpy = fn(debug('ns:error'))
    const completeSpy = fn(debug('ns:complete') as any)
    const s1 = readable({ eager: true, delayMs: 10, log: readableLog() })({ objectMode: true })(d1)
    const s2 = readable({ eager: true, delayMs: 15, log: readableLog() })({ objectMode: true })(d2)
    subscribeExAsync({ next: spy, error: errorSpy, complete: completeSpy })(s1, s2)

    await finished(s1, s2)

    expect(spy.calls).deep.eq([
      [{ value: 0, index: 0, event: 'data', emitter: s1, emitterIndex: 0 }],
      [{ value: 1, index: 1, event: 'data', emitter: s1, emitterIndex: 0 }],
      [{ value: 2, index: 2, event: 'data', emitter: s1, emitterIndex: 0 }],
      [{ value: 3, index: 3, event: 'data', emitter: s1, emitterIndex: 0 }],
      [{ value: 0, index: 0, event: 'data', emitter: s2, emitterIndex: 1 }],
      [{ value: 1, index: 1, event: 'data', emitter: s2, emitterIndex: 1 }],
      [{ value: 2, index: 2, event: 'data', emitter: s2, emitterIndex: 1 }],
      [{ value: 3, index: 3, event: 'data', emitter: s2, emitterIndex: 1 }],
    ])
    expect(errorSpy.calls).deep.eq([])
    expect(completeSpy.calls).deep.eq([
      [],
    ])
    expect(numEvents(s1, s2)).eq(0)
  })

  it('should work with unsubscribe', async () => {
    const d1 = makeNumbers(8)
    const spy = fn(makeWait(10))
    const errorSpy = fn(debug('ns:error'))
    const completeSpy = fn(debug('ns:complete') as any)
    const s1 = readable({ eager: true, delayMs: 10, log: readableLog() })({ objectMode: true })(d1)
    const unsub = subscribeExAsync({ next: spy, error: errorSpy, complete: completeSpy })(s1)

    unsub()

    await finished(s1)

    expect(spy.calls).deep.eq([])
    expect(errorSpy.calls).deep.eq([])
    expect(completeSpy.calls).deep.eq([])
    expect(numEvents(s1)).eq(0)
  })

  it('error handling - error break', async () => {
    const d1 = makeNumbers(4)
    const spy = fn(makeWait(10))
    const errorSpy = fn()
    const completeSpy = fn(debug('ns:complete') as any)
    const s1 = readable({ eager: true, delayMs: 10, log: readableLog(), errorAtStep: 1, continueOnError: false })({ objectMode: true })(d1)
    subscribeExAsync({ next: spy, error: errorSpy, complete: completeSpy })(s1)

    await finished(s1)

    expect(spy.calls).deep.eq([
      [{ value: 0, index: 0, event: 'data', emitter: s1, emitterIndex: 0 }],
    ])
    expect(errorSpy.calls.map(errorMessage)).deep.eq([
      [{ value: 'error at 1', index: 0, event: 'error', emitter: s1, emitterIndex: 0 }],
    ])
    expect(completeSpy.calls).deep.eq([
      [],
    ])
    expect(numEvents(s1)).eq(0)
  })

  it('error handling - error continue', async () => {
    const d1 = makeNumbers(4)
    const spy = fn(makeWait(10))
    const errorSpy = fn()
    const completeSpy = fn(debug('ns:complete') as any)
    const s1 = readable({ eager: true, delayMs: 10, log: readableLog(), errorAtStep: 1, continueOnError: true })({ objectMode: true })(d1)
    subscribeExAsync({ next: spy, error: errorSpy, complete: completeSpy })(s1)

    await finished(s1)

    expect(spy.calls).deep.eq([
      [{ value: 0, index: 0, event: 'data', emitter: s1, emitterIndex: 0 }],
      [{ value: 1, index: 1, event: 'data', emitter: s1, emitterIndex: 0 }],
      [{ value: 2, index: 2, event: 'data', emitter: s1, emitterIndex: 0 }],
      [{ value: 3, index: 3, event: 'data', emitter: s1, emitterIndex: 0 }],
    ])
    expect(errorSpy.calls.map(errorMessage)).deep.eq([
      [{ value: 'error at 1', index: 0, event: 'error', emitter: s1, emitterIndex: 0 }],
    ])
    expect(completeSpy.calls).deep.eq([
      [],
    ])
    expect(numEvents(s1)).eq(0)
  })
})
