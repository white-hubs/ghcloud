import { ConfigLoader } from '@/pages/config-loader'
import { defineAsyncComponent, defineComponent, h } from 'vue'

export const TitleBar = defineComponent({
  setup () {
    const TitleBarSkinDefault = defineAsyncComponent(async () => (await import('./skin-template/title-bar-skin-1')).TitleBarSkin1)
    const TitleBarSkinGis = defineAsyncComponent(async () => (await import('./skin-template/title-bar-skin-gis')).TitleBarSkinGis)

    return (): JSX.Element => h(ConfigLoader.config.entry === 'views-gis' ? TitleBarSkinGis : TitleBarSkinDefault)
  }
})
