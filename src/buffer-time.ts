import { Transform, TransformOptions } from 'stream'
import { waitTime } from '@psxcode/wait'
import buffer from './buffer'

const bufferTime = (opts: TransformOptions) => (ms: number) =>
  buffer(opts)(cb => waitTime(cb)(ms))

export default bufferTime
