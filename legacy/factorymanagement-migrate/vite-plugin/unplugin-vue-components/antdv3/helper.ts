import type { ComponentInfo } from 'unplugin-vue-components'
import { AntDesignVue3ResolverOptions } from './options'

interface Antdv3ComponentConfig {
  styleDir: string;
  componentRE: RegExp;
  // 一般用于子项的导入别名
  importName?: string;
}

const components: Antdv3ComponentConfig[] = [
  {
    componentRE: /^Avatar$/,
    styleDir: 'avatar',
  },
  {
    componentRE: /^AutoComplete$/,
    styleDir: 'auto-complete',
  },
  {
    componentRE: /^Anchor$/,
    styleDir: 'anchor',
  },

  {
    componentRE: /^Badge$/,
    styleDir: 'badge',
  },
  {
    componentRE: /^Breadcrumb$/,
    styleDir: 'breadcrumb',
  },
  {
    componentRE: /^Button$/,
    styleDir: 'button',
  },
  {
    componentRE: /^Checkbox$/,
    styleDir: 'checkbox',
  },
  {
    componentRE: /^Card$/,
    styleDir: 'card',
  },
  {
    componentRE: /^Cascader$/,
    styleDir: 'cascader',
  },
  {
    componentRE: /^Collapse$/,
    styleDir: 'collapse',
  },
  {
    componentRE: /^Descriptions$/,
    styleDir: 'descriptions',
  },
  {
    componentRE: /^Descriptions\.?Item$/,
    styleDir: 'descriptions',
    importName: 'DescriptionsItem'
  },
  {
    componentRE: /^RangePicker$|^WeekPicker$|^MonthPicker$/,
    styleDir: 'date-picker',
  },
  {
    componentRE: /^Dropdown$/,
    styleDir: 'dropdown',
  },

  {
    componentRE: /^Form$/,
    styleDir: 'form',
  },
  {
    componentRE: /^FormItem$/,
    styleDir: 'form',
  },
  {
    componentRE: /^Pagination$/,
    styleDir: 'pagination',
  },
  {
    componentRE: /^Modal$/,
    styleDir: 'modal',
  },
  {
    componentRE: /^InputNumber$/,
    styleDir: 'input-number',
  },

  {
    componentRE: /^Input$|^Textarea$/,
    styleDir: 'input',
  },
  {
    componentRE: /^Statistic$/,
    styleDir: 'statistic',
  },
  {
    componentRE: /^CheckableTag$/,
    styleDir: 'tag',
  },
  {
    componentRE: /^TimeRangePicker$/,
    styleDir: 'time-picker',
  },
  {
    componentRE: /^Layout$/,
    styleDir: 'layout',
  },
  {
    componentRE: /^Menu$|^SubMenu$|^MenuItem$/,
    styleDir: 'menu',
  },

  {
    componentRE: /^Table$/,
    styleDir: 'table',
  },
  {
    componentRE: /^TimePicker$|^TimeRangePicker$/,
    styleDir: 'time-picker',
  },
  {
    componentRE: /^Radio$|^RadioGroup$|^RadioButton/,
    styleDir: 'radio',
  },

  {
    componentRE: /^Image$/,
    styleDir: 'image',
  },

  {
    componentRE: /^List$/,
    styleDir: 'list',
  },
  {
    componentRE: /^Tabs$/,
    styleDir: 'tabs',
  },
  {
    componentRE: /^TabPane$/,
    styleDir: 'tabs',
    importName: 'TabPane'
  },
  {
    componentRE: /^Tabs\.TabPane$/,
    styleDir: 'tabs',
    importName: 'TabPane'
  },
  {
    componentRE: /^Mentions$/,
    styleDir: 'mentions',
  },

  {
    componentRE: /^Step$/,
    styleDir: 'steps',
  },
  {
    componentRE: /^Skeleton$/,
    styleDir: 'skeleton',
  },

  {
    componentRE: /^Select$/,
    styleDir: 'select',
  },
  {
    componentRE: /^TreeSelect$/,
    styleDir: 'tree-select',
  },
  {
    componentRE: /^Tree$|^DirectoryTree$/,
    styleDir: 'tree',
  },
  {
    componentRE: /^Typography$/,
    styleDir: 'typography',
  },
  {
    componentRE: /^Timeline$/,
    styleDir: 'timeline',
  },
  {
    componentRE: /^Upload$/,
    styleDir: 'upload',
  },
  {
    componentRE: /^Switch$/,
    styleDir: 'switch',
  },
  {
    componentRE: /^Spin$/,
    styleDir: 'spin',
  },
]

export class Antdv3ResolverHelper {
  public static getComponentInfo (componentName: string, options: AntDesignVue3ResolverOptions): ComponentInfo {
    const component = Antdv3ResolverHelper.matchComponent(componentName)
    if (component == null) {
      return
    }
    const { cjs = false, packageName = 'ant-design-vue', importStyle = 'less' } = options
    const path = `${packageName}/${cjs ? 'lib' : 'es'}`
    const sideEffects =
      importStyle === false ? undefined : Antdv3ResolverHelper.getPackageName(component, cjs, importStyle, packageName)
    return {
      name: component.importName ?? componentName,
      from: path,
      sideEffects,
    }
  }

  private static matchComponent (componentName: string): Antdv3ComponentConfig | undefined {
    return components.find(d => d.componentRE.test(componentName))
  }

  private static getBasePath (packageName: string, cjs: boolean): string {
    const lib = cjs ? 'lib' : 'es'
    return `${packageName}/${lib}`
  }

  private static getPackageName (
    componentConfig: Antdv3ComponentConfig,
    cjs: boolean,
    importStyle: string | false,
    packageName: string): string | undefined {
    if (importStyle === false) {
      return undefined
    }
    const styleDir = componentConfig.styleDir
    const base = Antdv3ResolverHelper.getBasePath(packageName, cjs)
    const baseStyle = `${base}/${styleDir}/style`
    if (importStyle === 'less') {
      return baseStyle
    }
    return `${baseStyle}/css`
  }
}
