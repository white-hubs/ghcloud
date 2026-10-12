export interface AntDesignVue3ResolverOptions {
  /**
   * exclude components that do not require automatic import
   *
   * @default []
   */
  exclude?: string[];
  /**
   * import style along with components. Set to false for ant-design-vue 4.x (CSS-in-JS).
   *
   * @default 'css'
   */
  importStyle?: 'css' | 'less' | false;
  /**
   * resolve `ant-design-vue' icons
   *
   * requires package `@ant-design/icons-vue`
   *
   * @default false
   */
  resolveIcons?: boolean;

  /**
   * use commonjs build default false
   * 'lib' or 'es'
   */
  cjs?: boolean;

  /**
   * rename package
   *
   * @default 'ant-design-vue'
   */
  packageName?: string;
}
