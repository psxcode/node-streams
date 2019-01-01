/* tslint:disable one-variable-per-declaration */
import ReadWriteStream = NodeJS.ReadWriteStream

const flatten = <T> (values: (T | T[])[]): T[] => {
  const res: T[] = []
  for (const v of values) {
    Array.isArray(v) ? res.push(...flatten(v)) : res.push(v)
  }

  return res
}

const pipe = (...streams: (ReadWriteStream | ReadWriteStream[])[]): ReadWriteStream[] => {
  const fls = flatten(streams)
  for (let i = 1, l = fls.length; i < l; ++i) {
    fls[i - 1].unpipe().pipe(fls[i])
  }

  return fls
}

export default pipe
