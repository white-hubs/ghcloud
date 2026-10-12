export interface ThemeConfig {
  prefix: string;
}

export class Theme {
  readonly #variableNames = new Map<string, string>()
  readonly #config: ThemeConfig
  #cacheVariables?: string
  #needRefresh = false

  public constructor (private readonly themeMap: Record<string, string>, config: Partial<ThemeConfig> = {}) {
    this.loadThemeMap()
    this.#config = this.configStandardization(config)
  }

  public add (name: string, value: string): void {
    this.update(name, value)
    this.#needRefresh = true
  }

  public remove (name: string): void {
    this.#variableNames.delete(name)
    this.#needRefresh = true
  }

  public update (name: string, value: string): void {
    this.#variableNames.set(name, value)
    this.#needRefresh = true
  }

  public get (name: string): string | undefined {
    return this.#variableNames.get(name)
  }

  public has (name: string): boolean {
    return this.#variableNames.has(name)
  }

  public getAll (): Map<string, string> {
    return this.#variableNames
  }

  public reset (): void {
    this.loadThemeMap()
    this.#needRefresh = true
  }

  /**
   *
   * @returns generated case
   * ```
   * --cube-theme-var--${key1}: ${value1};
   * --cube-theme-var--${key2}: ${value2};
   * ```
   */
  public generateCssVariables (): string {
    if (!this.#cacheVariables || this.#needRefresh) {
      this.#cacheVariables = [...this.#variableNames.entries()].map(([name, value]) => {
        return `--${this.#config.prefix}--${name}: ${value};`
      }).join('\n')
    }
    return this.#cacheVariables
  }

  private loadThemeMap (): void {
    this.#variableNames.clear()
    Object.entries(this.themeMap).forEach(([key, value]) => {
      this.#variableNames.set(key, value)
    })
  }

  private configStandardization (config: Partial<ThemeConfig>): ThemeConfig {
    return {
      prefix: config.prefix ?? 'cube-theme-var'
    }
  }
}
