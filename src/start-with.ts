import { ReadableOptions } from 'stream'
import concat from './concat'
import of from './of'
import ReadableStream = NodeJS.ReadableStream

const startWith = (opts: ReadableOptions) =>
  <T> (...values: T[]) =>
    (stream: ReadableStream) =>
      concat(opts)(of(opts)(...values), stream)

export default startWith
