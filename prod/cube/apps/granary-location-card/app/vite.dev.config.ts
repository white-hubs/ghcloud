import { defineConfig, loadEnv } from 'vite'
import { getBaseConfig } from './vite.config'

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv)
  const env = loadEnv(configEnv.mode, process.cwd(), '')
  const proxyTarget = env.VITE_API_PROXY_TARGET?.trim()
  const resourceProxyTarget = env.VITE_RESOURCE_PROXY_TARGET?.trim()
  const normalizedProxyTarget =
    proxyTarget != null && proxyTarget !== '' ? proxyTarget.replace(/\/api\/?$/, '') : ''
  const normalizedResourceProxyTarget =
    resourceProxyTarget != null && resourceProxyTarget !== ''
      ? resourceProxyTarget.replace(/\/resource\/?$/, '')
      : normalizedProxyTarget
  const proxy: Record<string, { target: string; changeOrigin: boolean }> = {}
  if (normalizedProxyTarget !== '') {
    proxy['/api'] = {
      target: normalizedProxyTarget,
      changeOrigin: true,
    }
  }
  if (normalizedResourceProxyTarget !== '') {
    proxy['/resource'] = {
      target: normalizedResourceProxyTarget,
      changeOrigin: true,
    }
  }
  return {
    ...baseConfig,
    server: {
      host: '0.0.0.0',
      port: 8890,
      ...(Object.keys(proxy).length > 0 ? { proxy } : {}),
    },
  }
})
