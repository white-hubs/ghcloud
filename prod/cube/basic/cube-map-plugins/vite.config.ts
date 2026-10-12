import path from 'path'
import { type UserConfig, defineConfig, type ConfigEnv } from 'vite'

// https://vitejs.dev/config/
const config = await defineConfig((env: ConfigEnv) => {
  const plugins = [] as NonNullable<UserConfig['plugins']>
  // 仅在开发服务器启用 ESLint，避免构建阶段因插件重复导致失败
  if (env.command === 'serve') {
    plugins.push(
    )
  }
  return {
    plugins,
    resolve: {
      alias: {
        '@ghcloud/cube-message-sdk': path.resolve(__dirname, './src')
      }
    }
  }
})

export async function getBaseConfig (env: ConfigEnv): Promise<UserConfig> {
  if (typeof config === 'function') {
    return config(env)
  }
  return config
}
