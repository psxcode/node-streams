import { EmitterValue } from 'node-on'

const isError = (obj: any): obj is Error => {
  return typeof obj === 'object' && typeof obj.stack === 'string'
}

const isEmitterValue = (obj: any): obj is EmitterValue => {
  return typeof obj === 'object' && typeof obj.index === 'number' && typeof obj.event === 'string'
}

export default ([err]) => {
  if (isError(err)) {
    return [err.message]
  }

  if (isEmitterValue(err) && isError(err.value)) {
    return [{
      ...err,
      value: err.value.message,
    }]
  }

  return [undefined]
}
