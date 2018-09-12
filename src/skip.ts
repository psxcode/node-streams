import { Transform, TransformOptions } from 'stream'
import filter from './filter'

const skip = (opts: TransformOptions) =>
  (numSkip: number) => {
    let i = 0
    return filter(opts)(() => i++ >= numSkip)
  }

export default skip
