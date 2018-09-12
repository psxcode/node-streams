import { Transform, TransformOptions } from 'stream'
import filter from './filter'

const take = (opts: TransformOptions) =>
  (numTake: number) => {
    let i = 0
    return filter(opts)(() => i++ < numTake)
  }

export default take
