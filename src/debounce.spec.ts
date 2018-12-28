import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import debounce from './debounce'

const log = debug('producer')

const interval = (next: () => void) => {
  console.log('subscribe')
  const id = setTimeout(next, 30)
  return () => {
    console.log('clear')
    clearTimeout(id)
  }
}

describe('[debounce]', () => {
  transformTest(
    makeNumbers(4),
    readable({ delayMs: 0, log })({ objectMode: true }),
    writable({})({ objectMode: true }),
    () => debounce({ objectMode: true })(interval))
})
