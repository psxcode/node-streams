import { Readable, ReadableOptions } from 'stream'
import { iterate } from 'iterama'

const _from = (opts: ReadableOptions) => <T> (iterable: Iterable<T>) => {
  const iterator = iterate(iterable)

  return new Readable({
    ...opts,
    read () {
      let result = iterator.next()
      while (!result.done && this.push(result.value !== null ? result.value : undefined)) {
        result = iterator.next()
      }
      if (result.done) {
        this.push(null)
      }
    },
  })
}

export default _from
