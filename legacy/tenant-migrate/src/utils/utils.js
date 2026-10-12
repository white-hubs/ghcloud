const getPushPath = (query = {}, path) => {
  const pathname_arr = location.pathname.split('/')
  pathname_arr[pathname_arr.length - 1] = path
  const pathname = pathname_arr.join('/').replaceAll('//', '/')
  let queryString = ''
  for (const key in query) {
    if (Object.hasOwnProperty.call(query, key)) {
      const element = query[key];
      if (element) {
        queryString += `${queryString ? '&' : ''}${key}=${element}`
      }
    }
  }
  return `${pathname}${queryString ? '?' + queryString : ''}`
};
export const historyPush = (query,path) => {
  const target = getPushPath(query,path);
  history.pushState(history.state, "", target)
}