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

export interface IAsyncObserver {
  next: (chunk: any) => Promise<void>
  error?: (err: Error) => Promise<void> | void,
  complete?: () => Promise<void> | void
}

export interface IAsyncObserverEx {
  next: (chunk: EmitterValue) => Promise<void>
  error?: (err: EmitterValue) => Promise<void> | void,
  complete?: () => Promise<void> | void
}
