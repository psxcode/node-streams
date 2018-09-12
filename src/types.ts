import EventEmitter = NodeJS.EventEmitter

export type WaitFn = (cb: () => void) => () => void
export type WaitPromiseFn = (ms: number) => Promise<any>
export type UnsubFn = (() => void) | undefined

export type EmitterValue = {
  value: any
  emitter: EventEmitter
  emitterIndex: number
}

export interface IObserver {
  next: (chunk: any) => void
  error?: (err: Error) => void,
  complete?: () => void
}

export interface IObserverEx {
  next: (chunk: EmitterValue) => void
  error?: (err: EmitterValue) => void,
  complete?: () => void
}
