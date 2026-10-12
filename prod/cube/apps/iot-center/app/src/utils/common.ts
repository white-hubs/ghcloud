export const guid = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export const getMonthList = (): {
  label: string;
  value: number;
}[] => {
  const monthList: {
    label: string;
    value: number;
  }[] = []
  for (let i = 1; i <= 12; i++) {
    monthList.push({
      label: `${i
      }月`,
      value: i
    })
  }
  return monthList
}
