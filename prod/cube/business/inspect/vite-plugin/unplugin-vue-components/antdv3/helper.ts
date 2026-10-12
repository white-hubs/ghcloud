import type { ComponentInfo } from 'unplugin-vue-components'
import type { AntDesignVue3ResolverOptions } from './options'

interface Antdv3ComponentConfig {
  styleDir: string;
  componentRe: RegExp;
  // 一般用于子项的导入别名
  importName?: string;
}

const components: Antdv3ComponentConfig[] = [
  {
    componentRe: /^Avatar$/,
    styleDir: 'avatar',
  },
  {
    componentRe: /^AutoComplete$/,
    styleDir: 'auto-complete',
  },
  {
    componentRe: /^Anchor$/,
    styleDir: 'anchor',
  },
  {
    componentRe: /^Tooltip$/,
    styleDir: 'tooltip',
  },
  {
    componentRe: /^Badge$/,
    styleDir: 'badge',
  },
  {
    componentRe: /^Breadcrumb$/,
    styleDir: 'breadcrumb',
  },
  {
    componentRe: /^Button$/,
    styleDir: 'button',
  },
  {
    componentRe: /^Checkbox$/,
    styleDir: 'checkbox',
  },
  {
    componentRe: /^CheckboxGroup$/,
    styleDir: 'checkbox',
  },
  {
    componentRe: /^Card$/,
    styleDir: 'card',
  },
  {
    componentRe: /^Pagination$/,
    styleDir: 'pagination',
  },
  {
    componentRe: /^Cascader$/,
    styleDir: 'cascader',
  },
  {
    componentRe: /^Collapse$/,
    styleDir: 'collapse',
  },
  {
    componentRe: /^Descriptions$/,
    styleDir: 'descriptions',
  },
  {
    componentRe: /^Descriptions\.?Item$/,
    styleDir: 'descriptions',
    importName: 'DescriptionsItem'
  },
  {
    componentRe: /^RangePicker$|^WeekPicker$|^MonthPicker$|^DatePicker$|^DateRangePicker$/,
    styleDir: 'date-picker',
  },
  {
    componentRe: /^Dropdown$/,
    styleDir: 'dropdown',
  },
  {
    componentRe: /^Modal$/,
    styleDir: 'modal',
  },
  {
    componentRe: /^Form$/,
    styleDir: 'form',
  },
  {
    componentRe: /^Popconfirm$/,
    styleDir: 'popconfirm',
  },
  {
    componentRe: /^FormItem$/,
    styleDir: 'form',
  },
  {
    componentRe: /^InputNumber$/,
    styleDir: 'input-number',
  },

  {
    componentRe: /^Input$|^Textarea$|^InputGroup$/,
    styleDir: 'input',
  },
  {
    componentRe: /^Statistic$/,
    styleDir: 'statistic',
  },
  {
    componentRe: /^CheckableTag$/,
    styleDir: 'tag',
  },
  {
    componentRe: /^TimeRangePicker$/,
    styleDir: 'time-picker',
  },
  {
    componentRe: /^Layout$/,
    styleDir: 'layout',
  },
  {
    componentRe: /^Menu$|^SubMenu$|^MenuItem$/,
    styleDir: 'menu',
  },

  {
    componentRe: /^Table$/,
    styleDir: 'table',
  },
  {
    componentRe: /^TimePicker$|^TimeRangePicker$/,
    styleDir: 'time-picker',
  },
  {
    componentRe: /^Radio$|^RadioGroup$|^RadioButton/,
    styleDir: 'radio',
  },
  {
    componentRe: /^Image$/,
    styleDir: 'image',
  },

  {
    componentRe: /^List$/,
    styleDir: 'list',
  },
  {
    componentRe: /^Tabs$/,
    styleDir: 'tabs',
  },
  {
    componentRe: /^TabPane$/,
    styleDir: 'tabs',
    importName: 'TabPane'
  },
  {
    componentRe: /^Tabs\.TabPane$/,
    styleDir: 'tabs',
    importName: 'TabPane'
  },
  {
    componentRe: /^Mentions$/,
    styleDir: 'mentions',
  },

  {
    componentRe: /^Step$/,
    styleDir: 'steps',
  },
  {
    componentRe: /^Skeleton$/,
    styleDir: 'skeleton',
  },

  {
    componentRe: /^Select$/,
    styleDir: 'select',
  },
  {
    componentRe: /^SelectOption$/,
    styleDir: 'select',
  },
  {
    componentRe: /^ConfigProvider$/,
    styleDir: 'config-provider',
  },
  //
  {
    componentRe: /^TreeSelect$/,
    styleDir: 'tree-select',
  },
  {
    componentRe: /^Tree$|^DirectoryTree$/,
    styleDir: 'tree',
  },
  {
    componentRe: /^Typography$/,
    styleDir: 'typography',
  },
  {
    componentRe: /^Timeline$/,
    styleDir: 'timeline',
  },
  {
    componentRe: /^Upload$/,
    styleDir: 'upload',
  },
  {
    componentRe: /^Row$/,
    styleDir: 'row',
  },
  {
    componentRe: /^Col$/,
    styleDir: 'col',
  },
  {
    componentRe: /^Space$/,
    styleDir: 'space',
  },
  {
    componentRe: /^Spin$/,
    styleDir: 'spin',
  },
  {
    componentRe: /^Dropdown$/,
    styleDir: 'dropdown',
  },
  {
    componentRe: /^Popover$/,
    styleDir: 'popover',
  },
  {
    componentRe: /^Cascader$/,
    styleDir: 'cascader',
  },
  {
    componentRe: /^TreeSelect$/,
    styleDir: 'TreeSelect',
  },
  {
    componentRe: /^Empty$/,
    styleDir: 'empty',
  },
  {
    componentRe: /^Divider$/,
    styleDir: 'divider',
  },
  {
    componentRe: /^Alert$/,
    styleDir: 'alert',
  },
  {
    componentRe: /^Message$/,
    styleDir: 'message',
  }
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
    return components.find(d => d.componentRe.test(componentName))
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
