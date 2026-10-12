import { qiankunWindow, renderWithQiankun, type QiankunProps } from 'vite-plugin-qiankun/dist/helper'
import { Application } from './app'
import { logger } from './logger'

const appBasePath = '/portal/granary-location-card'
const standaloneAppBasePath = '/apps/granary'

class Main {
  public static run (): void {
    new Main().init()
  }

  private app?: Application

  private constructor () {}

  public init (): void {
    if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
      this.renderWithDefault()
      return
    }

    this.renderWithQiankun()
  }

  private renderWithDefault (): void {
    this.applyFavicon()
    this.app = new Application({ base: standaloneAppBasePath })
    void this.app.install()
  }

  private renderWithQiankun (): void {
    renderWithQiankun({
      bootstrap: this.bootstrap.bind(this),
      mount: this.mount.bind(this),
      unmount: this.unmount.bind(this),
      update: this.update.bind(this),
    })
  }

  private bootstrap (): void {
    logger.debug('bootstrap')
  }

  private mount (props: QiankunProps): void {
    logger.debug('mount', props)
    this.applyFavicon()
    this.app = new Application({ base: appBasePath, ...props })
    void this.app.install()
  }

  private unmount (props: QiankunProps): void {
    logger.debug('unmount', props)
    this.app?.uninstall()
  }

  private update (props: QiankunProps): void {
    logger.debug('update', props)
  }

  private applyFavicon (): void {
    const baseUrl = `${import.meta.env.BASE_URL || '/'}`
    const fromBase = `${baseUrl.replace(/\/+$/, '/')}favicon-32.png?v=20260516`
    const fromRoot = '/favicon-32.png?v=20260516'
    const candidates = qiankunWindow.__POWERED_BY_QIANKUN__
      ? [fromBase, fromRoot]
      : [fromRoot, fromBase]

    const ensureIconLink = (id: string, rel: string): HTMLLinkElement => {
      let link = document.querySelector(`#${id}`) as HTMLLinkElement | null
      if (link == null) {
        link = document.createElement('link')
        link.id = id
        link.rel = rel
        link.type = 'image/png'
        document.head.appendChild(link)
      }
      link.sizes = '32x32'
      return link
    }

    const icon = ensureIconLink('app-favicon', 'icon')
    const shortcut = ensureIconLink('app-favicon-shortcut', 'shortcut icon')

    const trySet = (index: number): void => {
      if (index >= candidates.length) {
        return
      }
      const href = candidates[index]
      const probe = new Image()
      probe.onload = () => {
        icon.href = href
        shortcut.href = href
      }
      probe.onerror = () => {
        trySet(index + 1)
      }
      probe.src = href
    }

    trySet(0)
  }
}

Main.run()
