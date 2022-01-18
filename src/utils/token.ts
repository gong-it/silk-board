export const calculatePercent = (first: number, second: number) => {
  return first === 0 || second === 0 ? 0 : ((first / second) * 100 - 100).toFixed(2)
}

export const roundBalance = (balance: number) => {
  return Math.round((balance + Number.EPSILON) * 100) / 100
}
