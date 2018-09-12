import { Readable, ReadableOptions } from 'stream'

const empty = (opts: ReadableOptions) => () =>
  new Readable({
    ...opts,
    read () {
      this.push(null)
    }
  })

export default empty
