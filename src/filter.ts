import { Transform, TransformOptions } from 'stream'

const filter = (opts: TransformOptions) => <T> (predicate: (value: T) => boolean) =>
  new Transform({
    ...opts,
    transform (chunk, encoding, callback) {
      let res = false
      try {
        res = predicate(chunk as any)
      } catch (e) {
        this.push(null)

        return callback(e)
      }
      if (res) {
        this.push(chunk)
      }
      callback()
    },
  })

export default filter
