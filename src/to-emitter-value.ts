import { EmitterValue } from './types'

const toEmitterValue = (initial: EmitterValue) =>
  (cb: (value: any) => void) =>
    (value: any) => cb(Object.assign({}, initial, { value }))

export default toEmitterValue
