import { ReadableOptions } from 'stream'
import concat from './concat'
import of from './of'

const startWith = (opts: ReadableOptions) =>
  <T> (...values: T[]) =>
    (stream: NodeJS.ReadableStream) =>
      concat(opts)(of(opts)(...values), stream)

export default startWith
