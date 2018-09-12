import { Transform, TransformOptions } from 'stream'
import distinct from './distinct'

const isEqual = <T>(a: T, b: T) => a === b
const distinctUntilChanged = (opts: TransformOptions) => distinct(opts)(isEqual)

export default distinctUntilChanged
