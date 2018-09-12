import { Transform, TransformOptions } from 'stream'
import map from './map'

const pluck = (opts: TransformOptions) =>
  (propName: string) =>
    map(opts)((obj: { [k: string]: any }) => obj[propName])

export default pluck
