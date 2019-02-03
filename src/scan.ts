import { Transform, TransformOptions } from 'stream'

const scan = (opts: TransformOptions) => <T, R> (reducer: (state: R, value: T) => R) => {
  let state: any

  return new Transform({
    ...opts,
    transform (chunk, encoding, callback) {
      try {
        state = reducer(state, chunk)
      } catch (e) {
        callback(e)

        return
      }
      this.push(state !== null ? state : undefined)
      callback()
    },
  })
}

export default scan
