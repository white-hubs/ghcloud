const getMonth = (): string[] => {
  const num = new Date().getMonth() + 1
  const daynum = []
  for (let i = 0; i < num; i++) {
    daynum.push(`${i + 1}月`)
  }
  return daynum
}
const getDays = (): string[] => {
  const num = new Date().getDate()
  const daynum = []
  for (let i = 0; i < num; i++) {
    daynum.push(`${i + 1}号`)
  }
  return daynum
}
const getHour = (): string[] => {
  const num = new Date().getHours()
  const daynum = []
  for (let i = 0; i <= num; i++) {
    daynum.push(`${i}时`)
  }
  return daynum
}
const getWeek = (): string[] => {
  const num = new Date().getDay()
  const daynum = []
  for (let i = 1; i <= num; i++) {
    daynum.push(`周${i}`)
  }
  return daynum
}

const getDaysThree = (): string[] => {
  const num = new Date().getMonth() + 1
  const arr = [1, 3, 5, 7, 8, 10, 12]
  const mouth = arr.includes(num) ? 31 : 30
  const daynum = []
  for (let i = 0; i < mouth; i++) {
    daynum.push(`${i + 1}`)
  }
  return daynum
}
export { getMonth, getDays, getHour, getWeek, getDaysThree }
