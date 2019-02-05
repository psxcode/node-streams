import { Readable, ReadableOptions } from 'stream'

const of = (opts: ReadableOptions) => <T> (...values: T[]) => {
  let i = 0

  return new Readable({
    ...opts,
    read () {
      let value
      while (i < values.length && this.push((value = values[i++]) !== null ? value : undefined));
      if (i >= values.length) this.push(null)
    },
  })
}

export default of
