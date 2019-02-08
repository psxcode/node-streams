import { TransformOptions } from 'stream'
import { waitTime } from '@psxcode/wait'
import debounce from './debounce'

const debounceTime = (opts: TransformOptions) =>
  (ms: number) => debounce(opts)((cb) => waitTime(cb)(ms))

export default debounceTime
