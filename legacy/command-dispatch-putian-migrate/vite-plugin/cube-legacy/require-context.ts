import path from 'node:path'
import { Plugin } from 'vite'

const srcRE = new RegExp(path.resolve(__dirname, '../src'))
const requireContextRE = /\.legacy/g

export default function (): Plugin {
  return {
    name: 'vite-plugin-cube-require-context',
    transform: (code, id) => {
      if (srcRE.test(id) && requireContextRE.test(code)) {
        return code.replace(requireContextRE, '')
      }
      return code
    }
  }
}