/* tslint:disable no-conditional-assignment */
import { Readable, ReadableOptions } from 'stream'
import { iterate } from 'iterama'

const from = (opts: ReadableOptions) => <T> (iterable: Iterable<T>) => {
  const iterator = iterate(iterable)
  return new Readable({
    ...opts,
    read () {
      let result = iterator.next()
      while (!result.done && this.push(result.value)) {
        result = iterator.next()
      }
      if (result.done) {
        this.push(null)
      }
    }
  })
}

export default from
