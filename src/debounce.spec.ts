import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debounce from './debounce'
import debug from 'debug'

const log = debug('producer')

const interval = (next: () => void) => {
  console.log('subscribe')
  const id = setTimeout(next, 30)
  return () => {
    console.log('clear')
    clearTimeout(id)
  }
}

xdescribe('[debounce]', () => {
  transformTest(
    makeNumbers(4),
    (data) => readable({ delayMs: 0, log })({ objectMode: true })(data),
    (spy) => writable({})({ objectMode: true })(spy),
    () => debounce({ objectMode: true })(interval))
})
