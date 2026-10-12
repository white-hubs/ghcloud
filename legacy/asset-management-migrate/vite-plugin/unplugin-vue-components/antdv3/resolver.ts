import type { ComponentResolver } from 'unplugin-vue-components'
import { Antdv3ResolverHelper } from './helper'
import type { AntDesignVue3ResolverOptions } from './options'

export function antDesignVue3Resolver (options: AntDesignVue3ResolverOptions): ComponentResolver {
  return {
    type: 'component',
    resolve: (componentName) => {
      if (options.exclude?.includes(componentName) !== undefined) {
        return
      }
      if (options.resolveIcons !== undefined && (componentName.match(/(Outlined|Filled|TwoTone)$/) !== null)) {
        return {
          name: componentName,
          from: '@ant-design/icons-vue',
        }
      }
      return Antdv3ResolverHelper.getComponentInfo(componentName, options)
    }
  }
}
