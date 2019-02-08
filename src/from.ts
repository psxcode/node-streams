import { Readable, ReadableOptions } from 'stream'
import { iterate } from 'iterama'

const _from = (opts: ReadableOptions) => <T> (iterable: Iterable<T>): Readable => {
  const it = iterate(iterable)

  return new Readable({
    ...opts,
    read () {
      let res: IteratorResult<any>
      while (!(res = it.next()).done && this.push(res.value !== null ? res.value : undefined));
      if (res.done) this.push(null)
    },
    destroy () {
      this.push(null)
    },
  })
}

export default _from
