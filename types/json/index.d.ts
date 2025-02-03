declare module "*/.counter.json" {
  interface Counter {
    count: number
  }

  const value: Counter
  export = value
}
