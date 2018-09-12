import { IObserver } from './types'

const bindObserver = (observer: IObserver) => {
  const { next, error, complete } = observer
  return {
    next: next.bind(observer),
    error: error && error.bind(observer),
    complete: complete && complete.bind(observer)
  }
}

export default bindObserver
