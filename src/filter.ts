import { Transform, TransformOptions } from 'stream'

const filter = (opts: TransformOptions) => <T> (predicate: (value: T) => boolean) =>
  new Transform({
    ...opts,
    transform (chunk, encoding, callback) {
      let res = false
      try {
        res = predicate(chunk as any)
      } catch (e) {
        return callback(e)
      }
      callback(undefined, res ? chunk : undefined)
    }
  })

export default filter
