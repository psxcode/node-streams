import { Transform, TransformOptions } from 'stream'

const distinct = (opts: TransformOptions) =>
<T> (isEqual: (a: T, b: T) => boolean) => {
  let lastChunk: T
  return new Transform({
    ...opts,
    transform (chunk: any, encoding, callback) {
      if (lastChunk == null || !isEqual(lastChunk, chunk)) {
        lastChunk = chunk
        this.push(lastChunk)
      }
      callback()
    }
  })
}

export default distinct
