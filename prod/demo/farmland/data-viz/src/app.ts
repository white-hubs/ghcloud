import { createApp, type App } from 'vue'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import { routes } from './router'
import { getAuthInfo } from '@ghcloud/cube-auth-utils'
import { initAuthStore } from './api/auth-store.ts'
import 'amfe-flexible'
import 'animate.css'

interface RenderProps {
  container?: Element | string;
  base?: string;
  router?: Router;
}

export class Application {
  #app?: App<Element>

  private get app (): App<Element> {
    if (!this.#app) {
      throw new Error('app not initialized!')
    }
    return this.#app
  }

  public constructor (private readonly props: RenderProps) {}

  public async install (): Promise<void> {
    const { App: component } = await import('./app.tsx')
    await this.handleAuthStore()
    const app = createApp(component)
    this.installRouter(app)
    this.mount(app)
    this.#app = app
  }

  public async uninstall (): Promise<void> {
    this.app.unmount()
  }

  private installRouter (app: App<Element>): void {
    const { base = '' } = this.props
    const router = createRouter({
      history: createWebHistory(base),
      routes
    })
    app.use(router)
  }

  private mount (app: App<Element>): void {
    app.mount('#farmland-data-viz')
  }

  private async handleAuthStore (): Promise<void> {
    const env = (import.meta as unknown as { env: { MODE: string; }; }).env.MODE
    let authInfo = {
      token: '',
      tenant: '',
      terminal: 'bimops-manage-app'
    }
    // 方便开发时自定义token
    if (env === 'dev') {
      authInfo.token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRzIjpbIjY4NTQ3MTI4Il0sInBhc3N3b3JkX2V4cGlyZWQiOmZhbHNlLCJ1c2VyX25hbWUiOiIxNzMxMTM2OTc4MiIsImFkbWluIjpmYWxzZSwicGFzc3dvcmRfZm9yY2VkIjpmYWxzZSwiYXV0aG9yaXRpZXMiOlsiUk9MRV9BQ1RJVklUSV9VU0VSIiwiMTc4ODA4NDQ5MDc1NzgxMjIyNSJdLCJjbGllbnRfaWQiOiJjbGllbnRfMiIsInBhc3N3b3JkX2V4cGlyYXRpb25fcmVtaW5kZWQiOmZhbHNlLCJhZG1pbmlzdHJhdGVkX3RlbmFudHMiOlsiNjg1NDcxMjgiXSwic2NvcGUiOlsic2VsZWN0Il0sIm5hbWUiOiLotoXnuqfnrqHnkIblkZgiLCJpZCI6MTc4Mzc2NTk4MDU5ODU3OTIwMSwiZXhwIjoxODM0NTc4ODY4LCJqdGkiOiI1ZDM0ZGFmYi1jYjBhLTQ2MzktOTE3OC1lZTRlMjAwNTkyOWQifQ.PimneQ9NuvWuzbSkyeH9t5UeZa7NV0eJbqifnLwYaIlXjoxOyvpzyek2gB5h-yFu9nknXkp2xNJfY5WZ08WcP3vKgXebsAqP52UPvx_vJU4oBsZZ__yrBV9D9rRyBz9LGXE0k9fzR3G0X3vxyW-7G_8cdCAD7cpuyEeHRcnDf1bQJqxfucnUzfLg64XpFPj2GqBU9RHGck9D7UcqdwRBrncPtyjKDHtH7aCRGCr115q8DS9f_l8q7ZhUxTqf50VzrD3Hk6NSTajc9DejFRbUcFYX_KB8sGyvsPwv4Drn31UBBD745hVGAzcwYJhZl6dvYrrz5sSf1tV14P8Q0Ry3pw'
      authInfo.tenant = '68547128'
    } else {
      authInfo = await getAuthInfo()
    }
    initAuthStore(authInfo)
    return new Promise<void>((resolve) => {
      resolve()
    })
  }
}
