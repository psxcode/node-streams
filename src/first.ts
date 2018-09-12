import { Transform, TransformOptions } from 'stream'

const first = (opts: TransformOptions) => () => {
  let fulfilled = false
  return new Transform({
    ...opts,
    transform (chunk, encoding, callback) {
      if (!fulfilled) {
        this.push(chunk)
        this.push(null)
        fulfilled = true
      }
      callback()
    }
  })
}

export default first
