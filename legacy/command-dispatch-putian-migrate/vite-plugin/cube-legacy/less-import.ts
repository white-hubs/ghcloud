import path from 'node:path'
import { Plugin } from 'vite'

const sourcePath = path.resolve(__dirname, '../../src')
const fileRE = new RegExp(`${sourcePath}.*\\.less$`)
const requireContextRE = /^\s*@import\s*"~/g

/**
 * 处理 less 文件中 `@import "~xxx" 不被正确转换路径问题
 * @returns vite plugin
 */
export default function (): Plugin {
  return {
    name: 'vite-plugin-cube-less-import',
    transform: (code, id) => {
      if (fileRE.test(id) && requireContextRE.test(code)) {
        return code.replace(requireContextRE, '@import "/node_modules/')
      }
      return code
    }
  }
}