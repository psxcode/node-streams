/* tslint:disable no-empty */
import { Readable, ReadableOptions } from 'stream'

const of = <T> (opts: ReadableOptions) => (...values: T[]) => {
  let i = 0
  return new Readable({
    ...opts,
    read () {
      while (i < values.length && this.push(values[i++]));
      if (i >= values.length) this.push(null)
    }
  })
}

export default of
