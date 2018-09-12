import debounce from './debounce'
import { Transform, TransformOptions } from 'stream'
import { waitTime } from '@psxcode/wait'

const debounceTime = (opts: TransformOptions) =>
  (ms: number) => debounce(opts)(cb => waitTime(cb)(ms))

export default debounceTime
