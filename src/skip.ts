import { Transform, TransformOptions } from 'stream'
import FixedArray from 'circularr'

const skipFirst = (opts: TransformOptions) =>
  (numSkip: number) => {
    let i = 0

    return new Transform({
      ...opts,
      transform (chunk, encoding, callback) {
        if (i++ >= numSkip) {
          this.push(chunk !== null ? chunk : undefined)
        }
        callback()
      },
    })
  }

const skipLast = (opts: TransformOptions) =>
  (numSkip: number) => {
    let i = 0
    const last = new FixedArray<any>(numSkip)

    return new Transform({
      ...opts,
      transform (chunk, encoding, callback) {
        const value = last.shift(chunk)
        if (i++ >= numSkip) {
          this.push(value !== null ? value : undefined)
        }
        callback()
      },
    })
  }

const skip = (opts: TransformOptions) =>
  (numSkip: number) => (numSkip >= 0
    ? skipFirst(opts)(numSkip)
    : skipLast(opts)(-numSkip))

export default skip
