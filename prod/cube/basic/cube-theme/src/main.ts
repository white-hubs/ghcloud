import type { Theme } from './theme'
import { AuroraGreenTheme, DawnBlueTheme, DurkOrangeTheme, PublicSecurityBlueTheme, RightCyanTheme } from './themes'
import { Antd3AuroraGreenTheme, Antd3DawnBlueTheme, Antd3PublicSecurityBlueTheme, Antd3DurkOrangeTheme, Antd3RightCyanTheme } from './themes-legacy/antd3'

enum StyleAttrs {
  ID = 'data-cube-theme-id',
  NAME = 'data-cube-theme-name',
}

const themeCacheKey = 'data-cube-theme-cache'

interface CubeThemeManagerConfig<T> {
  defaultThemeName?: keyof T;
  styleId?: string;
  styleName?: string;
  // @default `true`
  cache?: boolean;
  cacheKey?: string;
}

export class CubeThemeManager<T extends Record<string, Theme>> {
  #styleContainer?: HTMLStyleElement

  public constructor (private readonly themeConfigs: T, private readonly config: CubeThemeManagerConfig<T> = {}) {}

  public mount (): void {
    const { themeConfigs, config: { defaultThemeName = '开河蓝', cache = true, cacheKey = themeCacheKey } } = this
    const cacheTheme = localStorage.getItem(cacheKey)
    if (cache && cacheTheme && Object.keys(themeConfigs).includes(cacheTheme)) {
      this.use(cacheTheme)
    } else if (defaultThemeName) {
      this.use(defaultThemeName)
    } else if (Object.keys(themeConfigs).length > 0) {
      this.use(Object.keys(themeConfigs)[0] as keyof T)
    }
  }

  public use (themeName: keyof T): void {
    if (!this.#styleContainer) {
      this.#styleContainer = this.generateStyleContainer()
      document.head.appendChild(this.#styleContainer)
    }
    const theme = this.themeConfigs[themeName]

    if (!theme) {
      throw new Error(`cannot find theme '${String(themeName)}'`)
    }
    const { cache = true, styleName = StyleAttrs.NAME } = this.config
    this.#styleContainer.setAttribute(`data-${styleName}`, String(themeName))
    this.#styleContainer.innerText = `:root {${theme.generateCssVariables()}}`
    if (cache) {
      localStorage.setItem(themeCacheKey, String(themeName))
    }
  }

  public getThemeVars (themeName?: string): string {
    const { themeConfigs, config: { defaultThemeName = '极光绿', cache = true, cacheKey = themeCacheKey } } = this
    const cacheTheme = localStorage.getItem(cacheKey)
    if (!themeName) {
      themeName = defaultThemeName as string
      if (cache && cacheTheme && Object.keys(themeConfigs).includes(cacheTheme)) {
        themeName = cacheTheme
      }
    }
    return themeConfigs[themeName].get('primaryColor') ?? ''
  }

  public getThemeVarsAll (themeName?: string): Map<string, string> {
    const { themeConfigs, config: { defaultThemeName = '极光绿', cache = true, cacheKey = themeCacheKey } } = this
    const cacheTheme = localStorage.getItem(cacheKey)
    if (!themeName) {
      themeName = defaultThemeName as string
      if (cache && cacheTheme && Object.keys(themeConfigs).includes(cacheTheme)) {
        themeName = cacheTheme
      }
    }
    return themeConfigs[themeName].getAll()
  }

  public getCurrentThemeName (): string {
    const { themeConfigs, config: { defaultThemeName = '极光绿', cache = true, cacheKey = themeCacheKey } } = this
    const cacheTheme = localStorage.getItem(cacheKey)
    let themeName = defaultThemeName as string
    if (cache && cacheTheme && Object.keys(themeConfigs).includes(cacheTheme)) {
      themeName = cacheTheme
    }
    return themeName
  }

  public getCurrentThemePrimaryColor (): string {
    return this.getThemeVars(this.getCurrentThemeName())
  }

  public clear (): void {
    throw new Error('Not yet implemented.')
  }

  private generateStyleContainer (): HTMLStyleElement {
    const style = document.createElement('style')
    const { styleId = StyleAttrs.ID } = this.config
    style.setAttribute(StyleAttrs.ID, styleId)
    return style
  }
}

export * from './themes'
export * from './themes-legacy/antd3'
export * from './theme'


export const themeManager = new CubeThemeManager(
  {
    极光绿: AuroraGreenTheme,
    开河蓝: DawnBlueTheme,
    公安蓝: PublicSecurityBlueTheme,
    日暮色: DurkOrangeTheme,
    明青色: RightCyanTheme,
  },
  {
    defaultThemeName: '开河蓝',
  }
)
export const antd3LegacyThemeManager = new CubeThemeManager(
  {
    极光绿: Antd3AuroraGreenTheme,
    开河蓝: Antd3DawnBlueTheme,
    公安蓝: Antd3PublicSecurityBlueTheme,
    日暮色: Antd3DurkOrangeTheme,
    明青色: Antd3RightCyanTheme,
  },
  {
    defaultThemeName: '开河蓝',
    styleId: 'antd3-legacy-theme',
  }
)
