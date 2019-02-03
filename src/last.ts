import { Transform, TransformOptions } from 'stream'

const last = (opts: TransformOptions) => {
  let value: any

  return new Transform({
    ...opts,
    transform (chunk, encoding, callback) {
      value = chunk !== null ? chunk : undefined
      callback()
    },
    flush (callback) {
      this.push(value)
      callback()
    },
  })
}

export default last
