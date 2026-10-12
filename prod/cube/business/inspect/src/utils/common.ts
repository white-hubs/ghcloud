interface Department {
  id: string;
  name: string;
}
// 扁平化
/*
 *  bossArr  树形数据
 *  children 树形数据子数据的属性名, 本项目为 children
 * */
export const extractTree = (bossArr: any, children: string) => {
  // 如果为空 返回空（防止 children 递归报错）
  if (!Array.isArray(bossArr) && !bossArr.length) return []
  const list: Department[] = []
  const getObj = (arr: any[]) => {
    arr.forEach((row: Record<string, any>) => {
      let obj:any = {}
      obj = JSON.parse(JSON.stringify(row))
      list.push(obj)
      if (row[children]) {
        getObj(row[children])
      }
    })
    return list
  }
  return getObj(bossArr)
}
