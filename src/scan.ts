import { Transform, TransformOptions } from 'stream'

const scan = (opts: TransformOptions) => <T, R> (reducer: (state: R, value: T) => R) => {
  let state: any

  return new Transform({
    ...opts,
    transform (chunk, encoding, callback) {
      try {
        state = reducer(state, chunk)
      } catch (e) {
        this.push(null)

        return callback(e)
      }
      this.push(state !== null ? state : undefined)
      callback()
    },
  })
}

export default scan
