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
const getHourall = (): string[] => {
  const daynum = []
  for (let i = 0; i < 24; i++) {
    daynum.push(`${i + 1}`)
  }
  return daynum
}
const getXData = (flag: 'TODAY' | 'THIS_MONTH' | 'THIS_YEAR', list: Array<{ timeFlag: number }>): string[] => {
  if (flag === 'TODAY') {
    return list.map(res => `${res.timeFlag}` + '时')
  } else if (flag === 'THIS_MONTH') {
    return list.map(res => `${res.timeFlag}` + '号')
  } else {
    return list.map(res => `${res.timeFlag}` + '月')
  }
}
const getDaysThree = (): string[] => {
  return new Array(30).fill(0).map((_, idx) =>
  `${new Date(new Date().getTime() - idx * (24 * 60 * 60 * 1000)).getMonth() + 1}-${new Date(new Date().getTime() - idx * (24 * 60 * 60 * 1000)).getDate()}`

  ).reverse()
}
const xInfo = (list: any) => {
  return list.map((res: any, index: number) => index + 1)
}
const getUsageYear=()=>{
  const currentDecade = new Date().getFullYear();
  const decadesArray = [];
  
  for (let i = 0; i < currentDecade-2012; i++) {
    decadesArray.push({label:currentDecade - i,value:currentDecade - i});
  }
   return decadesArray
}
export { getMonth, getDays, getHour, getXData, getDaysThree, getHourall, xInfo ,getUsageYear}
