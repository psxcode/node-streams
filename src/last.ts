import { Transform, TransformOptions } from 'stream'

const last = (opts: TransformOptions) => () => {
  let value: any
  return new Transform({
    ...opts,
    transform (chunk, encoding, callback) {
      value = chunk
      callback()
    },
    flush (callback) {
      callback(undefined, value)
    }
  })
}

export default last
