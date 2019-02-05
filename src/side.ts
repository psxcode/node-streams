import { Transform, TransformOptions } from 'stream'

const side = (opts: TransformOptions) => <T> (sideFn: (value: T) => void) =>
  new Transform({
    ...opts,
    transform (chunk: any, encoding, callback) {
      try {
        sideFn(chunk)
      } catch (e) {
        return callback(e)
      }
      this.push(chunk)
      callback()
    },
  })

export default side
