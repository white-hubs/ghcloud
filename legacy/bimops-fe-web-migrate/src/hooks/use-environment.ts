import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'

export const inDesktopClient = getEnvironment() === 'cubeDesktopClient'
export const inIframe = window !== window.top