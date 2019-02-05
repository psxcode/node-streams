import { Transform, TransformOptions } from 'stream'

const distinct = (opts: TransformOptions) =>
  (isEqual: (a: any, b: any) => boolean) => {
    /* null is never passed from downstream, so its a perfect start value */
    let lastChunk: any = null

    return new Transform({
      ...opts,
      transform (chunk: any, encoding, callback) {
        if (!isEqual(lastChunk, chunk)) {
          lastChunk = chunk
          this.push(lastChunk)
        }
        callback()
      },
    })
  }

export default distinct
