import { Transform, TransformOptions } from 'stream'

const scan = (opts: TransformOptions) => <T, R> (reducer: (state: R, value: T) => R) => {
  let state: any
  return new Transform({
    ...opts,
    transform (chunk: any, encoding, callback) {
      try {
        state = reducer(state, chunk)
      } catch (e) {
        return callback(e)
      }
      callback(undefined, state)
    }
  })
}

export default scan
