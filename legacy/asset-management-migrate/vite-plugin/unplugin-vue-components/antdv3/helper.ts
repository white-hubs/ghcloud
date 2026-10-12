import type { ComponentInfo } from 'unplugin-vue-components'
import type { AntDesignVue3ResolverOptions } from './options'

interface Antdv3ComponentConfig {
  styleDir: string;
  componentRe: RegExp;
  // 一般用于子项的导入别名
  importName?: string
}

const components: Antdv3ComponentConfig[] = [
  {
    componentRe: /^Avatar$/,
    styleDir: 'avatar',
  },
  {
    componentRe: /^Switch$/,
    styleDir: 'switch',
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
    componentRe: /^Badge$/,
    styleDir: 'badge',
  },
  {
    componentRe: /^Breadcrumb$/,
    styleDir: 'breadcrumb',
  },
  {
    componentRe: /^BreadcrumbItem$/,
    styleDir: 'breadcrumb',
  },
  {
    componentRe: /^Modal$/,
    styleDir: 'modal',
  },
  {
    componentRe: /^Popconfirm$/,
    styleDir: 'popconfirm',
  },
  {
    componentRe: /^Button$/,
    styleDir: 'button',
  },
  {
    componentRe: /^Checkbox|CheckboxGroup$/,
    styleDir: 'checkbox',
  },
  {
    componentRe: /^Card$/,
    styleDir: 'card',
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
    componentRe: /^RangePicker$|^WeekPicker$|^MonthPicker$|^DatePicker$/,
    styleDir: 'date-picker',
  },
  {
    componentRe: /^Dropdown$/,
    styleDir: 'dropdown',
  },

  {
    componentRe: /^Form$/,
    styleDir: 'form',
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
    componentRe: /^Input$|^Textarea$/,
    styleDir: 'input',
  },
  {
    componentRe: /^Statistic$/,
    styleDir: 'statistic',
  },
  {
    componentRe: /^CheckableTag$|^Tag/,
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
    componentRe: /^LayoutSider$/,
    styleDir: 'layout',
  },
  {
    componentRe: /^LayoutHeader$/,
    styleDir: 'layout',
  },
  {
    componentRe: /^LayoutContent$/,
    styleDir: 'layout',
  },
  {
    componentRe: /^Menu$|^SubMenu$/,
    styleDir: 'menu',
  },
  {
    componentRe: /^MenuItem$/,
    styleDir: 'menu',
  },
  {
    componentRe: /^Table$/,
    styleDir: 'table',
  },
  {
    componentRe: /^Pagination$/,
    styleDir: 'pagination',
  },
  {
    componentRe: /^TimePicker$|^TimeRangePicker$/,
    styleDir: 'time-picker',
  },
  {
    componentRe: /^Radio$/,
    styleDir: 'radio',
  },

  {
    componentRe: /^RadioGroup$/,
    styleDir: 'radio',
  },
  {
    componentRe: /^Divider$/,
    styleDir: 'divider',
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
    componentRe: /^Select|SelectOption$/,
    styleDir: 'select',
  },
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
    componentRe: /^Space$/,
    styleDir: 'space',
  },
  {
    componentRe: /^TimeRangePicker$/,
    styleDir: 'time',
  },
  {
    componentRe: /^InputGroup$/,
    styleDir: 'input',
  },
  {
    componentRe: /^Popover$/,
    styleDir: 'popover',
  },
  {
    componentRe: /^RadioGroup$/,
    styleDir: 'radio',
  },
  {
    componentRe: /^Spin$/,
    styleDir: 'spin',
  },
  {
    componentRe: /^Empty$/,
    styleDir: 'empty',
  },

]

export class Antdv3ResolverHelper {
  public static getComponentInfo(componentName: string, options: AntDesignVue3ResolverOptions): ComponentInfo {
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

  private static matchComponent(componentName: string): Antdv3ComponentConfig | undefined {
    return components.find(d => d.componentRe.test(componentName))
  }

  private static getBasePath(packageName: string, cjs: boolean): string {
    const lib = cjs ? 'lib' : 'es'
    return `${packageName}/${lib}`
  }

  private static getPackageName(
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
