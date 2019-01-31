export const interval = (
  setTimeout: (cb: any, delay: number) => any,
  clearTimeout: (id: any) => void
) => (ms: number) => (cb: Function) => {
  const id = setTimeout(cb, ms)

  return () => clearTimeout(id)
}

export default interval(setTimeout, clearTimeout)
