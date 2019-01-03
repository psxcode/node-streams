import { Readable, ReadableOptions } from 'stream'

const of = (opts: ReadableOptions) => <T> (...values: T[]) => {
  let i = 0

  return new Readable({
    ...opts,
    read () {
      while (i < values.length && this.push(values[i++]));
      if (i >= values.length) this.push(null)
    },
  })
}

export default of
