
export const loadScript = (url:string) => {
  let script = document.createElement('script')
  script.setAttribute('type', 'text/javascript')
  script.setAttribute('src', url)
  let head = document.getElementsByTagName('head')
  if (head.length) {
    head[0].appendChild(script)
  } else {
    document.documentElement.appendChild(script)
  }
}