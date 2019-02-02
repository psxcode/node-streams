import { Transform, TransformOptions } from 'stream'
import FixedArray from 'circularr'

const takeFirst = (opts: TransformOptions) =>
  (numTake: number) => {
    let i = 0

    return new Transform({
      ...opts,
      transform (chunk, encoding, callback) {
        /* push properly delivers null */
        this.push(i++ < numTake ? chunk : null)
        callback(undefined)
      },
    })
  }

const takeLast = (opts: TransformOptions) =>
  (numTake: number) => {
    const last = new FixedArray<any>(numTake)
    let numValues = 0

    return new Transform({
      ...opts,
      transform (chunk, encoding, callback) {
        last.shift(chunk)
        ++numValues
        callback(undefined)
      },
      flush (callback) {
        const it = last[Symbol.iterator]()
        /* skip empty values */
        const numEmptyValues = last.length - numValues
        for (let i = 0; i < numEmptyValues; ++i) {
          it.next()
        }
        for (const chunk of it) {
          this.push(chunk)
        }
        callback(undefined)
      },
    })
  }

const take = (opts: TransformOptions) =>
  (numTake: number) => (
    numTake >= 0
      ? takeFirst(opts)(numTake)
      : takeLast(opts)(-numTake)
  )

export default take
