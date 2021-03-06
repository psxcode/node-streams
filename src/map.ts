import { Transform, TransformOptions } from 'stream'

const map = (opts: TransformOptions) => <T, R> (xf: (value: T) => R) =>
  new Transform({
    ...opts,
    transform (chunk, encoding, callback) {
      let res
      try {
        res = xf(chunk as any)
      } catch (e) {
        this.push(null)

        return callback(e)
      }
      this.push(res)
      callback()
    },
  })

export default map
