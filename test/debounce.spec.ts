import { describe, it } from 'mocha'
import { expect } from 'chai'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import debounce from '../src/debounce'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import interval from './interval'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

describe('[debounce]', () => {
  it('should work', async () => {
    const data = makeNumbers(4)
    const spy = createSpy(() => {})
    const r = readable({ eager: true, delayMs: 0, log: readableLog })({ objectMode: true })(data)
    const t = debounce({ objectMode: true })(interval(30))
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(t).pipe(w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
