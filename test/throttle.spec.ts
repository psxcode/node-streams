import { pipeline } from 'stream'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import throttle from '../src/throttle'
import makeNumbers from './make-numbers'
import finished from './stream-finished'

const readableLog = debug('node-streams:readable')
const writableLog = debug('node-streams:writable')

const interval = (next: () => void) => {
  console.log('subscribe')
  const id = setTimeout(next, 30)

  return () => {
    console.log('clear')
    clearTimeout(id)
  }
}

describe('[ throttle ]', () => {
  it('shoudl work', async () => {
    const data = makeNumbers(8)
    const spy = createSpy(() => {})
    const r = readable({ eager: true, delayMs: 0, log: readableLog })({ objectMode: true })(data)
    const t = throttle({ objectMode: true })(interval)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = pipeline(r, t, w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
