import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import buffer from './buffer'

const log = debug('producer')

const interval = (next: () => void) => {
  console.log('subscribe')
  const id = setTimeout(next, 30)
  return () => {
    console.log('clear')
    clearTimeout(id)
  }
}

xdescribe('[ buffer ]', () => {
  transformTest(
    makeNumbers(4),
    (data) => readable({ delayMs: 5, log })({ objectMode: true })(data),
    (spy) => writable({})({ objectMode: true })(spy),
    () => buffer({ objectMode: true })(interval))
})
