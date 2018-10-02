import { EmitterValue } from 'node-on'

export type WaitFn = (cb: () => void) => () => void
export type UnsubFn = (() => void) | undefined

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
