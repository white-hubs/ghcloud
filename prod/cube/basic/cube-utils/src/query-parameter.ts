type DataType = Record<string, string | string[] | number | boolean | null | undefined>

function setInfo (info: { path: string; form: DataType; }): void {
  const queryInfoList = sessionStorage.getItem('queryParameter')

  if (queryInfoList) {
    const list: { path: string; form: DataType; }[] = JSON.parse(queryInfoList)
    const index = list.findIndex((item) => item.path === info.path)
    if (index === -1) {
      list.push(info)
    } else {
      list.map((item) => {
        if (item.path === info.path) {
          item = info
        }
        return item
      })
    }

    sessionStorage.setItem('queryParameter', JSON.stringify(list))
  } else {
    sessionStorage.setItem('queryParameter', JSON.stringify([info]))
  }
}

function getInfo (path: string): { path: string; form: DataType; } | null {
  const queryInfo = sessionStorage.getItem('queryParameter')
  if (queryInfo) {
    const queryInfoList: { path: string; form: DataType; }[] = JSON.parse(queryInfo)
    const info: { path: string; form: DataType; } | undefined = queryInfoList.find((item: { path: string; }) => item.path === path)
    if (info) {
      return info
    } else {
      return null
    }
  } else {
    return null
  }
}
function clearInfo (): void {
  sessionStorage.removeItem('queryParameter')
}

function setAddressQuery (info: DataType): void {
  const data = JSON.parse(JSON.stringify(info))
  let query = ''
  for (const key in data) {
    query += `${key}=${data[key]}&`
  }
  const path = window.location.pathname.replace(window.location.search, '')
  const address = `${window.location.origin}${path}`
  history.replaceState({ current: location.pathname }, '', `${address}?${query}`)
}
function getQuery (value?: string): DataType | null {
  const query = window.location.search
  if (query) {
    const queryList = decodeURIComponent(query).replace('?', '').split('&')
    const queryObj: DataType = {}
    queryList.forEach((item) => {
      const keyValue = item.split('=')
      if (keyValue[0] !== '') {
        if (keyValue[0] === value) {
          queryObj[keyValue[0]] = keyValue[1] === '' ? [] : keyValue[1] === 'null' ? [] : keyValue[1].split(',')
        } else {
          queryObj[keyValue[0]] = keyValue[1] === 'null' ? '' : keyValue[1] === 'undefined' ? undefined : keyValue[1]
        }
      }
    })

    return queryObj
  } else {
    return null
  }
}

const queryParameter = {
  getQuery,
  setAddressQuery,
  setInfo,
  clearInfo,
  getInfo
}
export { queryParameter }
