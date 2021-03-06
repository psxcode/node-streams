import { Transform, TransformOptions } from 'stream'

const reduce = (opts: TransformOptions) => <T, R> (reducer: (state: R, value: T) => R) => {
  let state: any

  return new Transform({
    ...opts,
    transform (chunk: any, encoding, callback) {
      try {
        state = reducer(state, chunk)
      } catch (e) {
        this.push(null)

        return callback(e)
      }
      callback()
    },
    flush (callback) {
      this.push(state !== null ? state : undefined)
      callback()
    },
  })
}

export default reduce
