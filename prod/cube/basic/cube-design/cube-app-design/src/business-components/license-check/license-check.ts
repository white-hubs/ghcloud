import { type App, createApp, h } from 'vue'
import { LicenseCheckComponent } from './license-check-component'
let app: App<Element>;

export const licenseCheck = (): void=>{
  const rootDom = document.createElement('div')
  rootDom.id = 'cube-license-check'
  document.body.appendChild(rootDom)
  app = createApp({
    setup (){
      return (): JSX.Element=> h(LicenseCheckComponent, {
        onClose: ()=>{
          app?.unmount()
          rootDom.remove()
        }
      })
    }
  })
  app.mount(rootDom)
}