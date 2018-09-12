/* tslint:disable one-variable-per-declaration */
import ReadWriteStream = NodeJS.ReadWriteStream

const flatten = <T> (values: (T | T[])[]): T[] => {
  let res: T[] = []
  for (let v of values) {
    Array.isArray(v) ? res.push(...flatten(v)) : res.push(v)
  }
  return res
}

const pipe = (...streams: (ReadWriteStream | ReadWriteStream[])[]): ReadWriteStream[] => {
  const fls = flatten(streams)
  for (let i = 0, l = fls.length; i < l; ++i) {
    fls[i].unpipe()
    if (i + 1 < l) {
      fls[i].pipe(fls[i + 1])
    }
  }
  return fls
}

export default pipe
