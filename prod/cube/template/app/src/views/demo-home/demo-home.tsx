import { Button, Card, Divider, Space } from '@ghcloud/cube-ui'
import { defineComponent, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { LOCALE_STORAGE_KEY, routeNameToMessageKey } from '@/locales'

type RouteName = string

function sceneRoute (n: number): string {
  return `showcase-scene-s${String(n).padStart(2, '0')}`
}

function NavButtonRow (props: {
  names: RouteName[]
  go: (n: string) => void
  t: (k: string) => string
  size?: 'small' | 'middle' | 'large'
  primaryIndex?: number
}): JSX.Element {
  const { names, go, t, size = 'middle', primaryIndex = -1 } = props
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {names.map((name, idx) => (
        <Button
          key={name}
          size={size}
          type={idx === primaryIndex ? 'primary' : 'default'}
          onClick={() => go(name)}
        >
          {t(`home.routes.${routeNameToMessageKey(name)}`)}
        </Button>
      ))}
    </div>
  )
}

const ROUTE_BASICS: RouteName[] = ['demo-list', 'demo-detail', 'demo-edit', 'module-demo']

const ROUTE_AGGREGATE: RouteName[] = [
  'showcase-table',
  'showcase-form',
  'showcase-modal',
  'showcase-layout',
  'showcase-display',
  'showcase-upload-tree',
  'showcase-excel',
  'showcase-echarts',
  'showcase-remote',
]

const ROUTE_LAYOUT_NAV: RouteName[] = [1, 2, 3, 4, 5, 6, 7, 8, 62].map(sceneRoute)

const ROUTE_TABLE_LIST: RouteName[] = Array.from({ length: 22 - 9 + 1 }, (_, i) => sceneRoute(i + 9))

const ROUTE_FORM_ENTRY: RouteName[] = [
  ...Array.from({ length: 32 - 23 + 1 }, (_, i) => sceneRoute(i + 23)),
  ...[45, 46, 47, 48, 49, 50].map(sceneRoute),
]

const ROUTE_FEEDBACK: RouteName[] = [
  ...Array.from({ length: 44 - 38 + 1 }, (_, i) => sceneRoute(i + 38)),
  sceneRoute(52),
  sceneRoute(55),
]

const ROUTE_DISPLAY: RouteName[] = [
  ...Array.from({ length: 37 - 33 + 1 }, (_, i) => sceneRoute(i + 33)),
  sceneRoute(51),
  sceneRoute(53),
  sceneRoute(54),
  ...Array.from({ length: 61 - 56 + 1 }, (_, i) => sceneRoute(i + 56)),
]

const ROUTE_CHARTS_FILES: RouteName[] = Array.from({ length: 67 - 63 + 1 }, (_, i) => sceneRoute(i + 63))

const ROUTE_OTHER: RouteName[] = [sceneRoute(68), sceneRoute(69)]

/**
 * 模板应用首页：`vue-i18n` 中英切换、按功能分组的示例入口（mock；不含图编辑）。
 */
const DemoHome = defineComponent({
  name: 'DemoHome',
  setup: () => {
    const router = useRouter()
    const { t, locale } = useI18n()

    onMounted(() => {
      if (typeof localStorage === 'undefined') {
        return
      }
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
      if (stored === 'en-US' || stored === 'zh-CN') {
        locale.value = stored
      }
    })

    const setLocale = (lang: 'zh-CN' | 'en-US'): void => {
      locale.value = lang
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LOCALE_STORAGE_KEY, lang)
      }
    }

    const go = (name: string): void => {
      void router.push({ name })
    }

    return (): JSX.Element => (
      <div class='pd-20'>
        <Card title={t('home.title')}>
          <Space direction='vertical' size='middle' style={{ width: '100%' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
              <span>{t('home.langLabel')}：</span>
              <Button
                type={locale.value === 'zh-CN' ? 'primary' : 'default'}
                size='middle'
                onClick={() => setLocale('zh-CN')}
              >
                {t('home.langZh')}
              </Button>
              <Button
                type={locale.value === 'en-US' ? 'primary' : 'default'}
                size='middle'
                onClick={() => setLocale('en-US')}
              >
                {t('home.langEn')}
              </Button>
            </div>

            <p>{t('home.intro')}</p>
            <p>{t('home.readTitle')}</p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>{t('home.readReadme')}</li>
              <li>{t('home.readAdr')}</li>
              <li>{t('home.readSkill')}</li>
            </ul>
          </Space>

          <Divider orientation='left'>{t('home.groups.basics')}</Divider>
          <NavButtonRow names={ROUTE_BASICS} go={go} t={t} primaryIndex={0} />

          <Divider orientation='left'>{t('home.groups.aggregate')}</Divider>
          <NavButtonRow names={ROUTE_AGGREGATE} go={go} t={t} />

          <Divider orientation='left'>{t('home.groups.layoutNav')}</Divider>
          <NavButtonRow names={ROUTE_LAYOUT_NAV} go={go} t={t} />

          <Divider orientation='left'>{t('home.groups.tableList')}</Divider>
          <NavButtonRow names={ROUTE_TABLE_LIST} go={go} t={t} />

          <Divider orientation='left'>{t('home.groups.formEntry')}</Divider>
          <NavButtonRow names={ROUTE_FORM_ENTRY} go={go} t={t} />

          <Divider orientation='left'>{t('home.groups.feedback')}</Divider>
          <NavButtonRow names={ROUTE_FEEDBACK} go={go} t={t} />

          <Divider orientation='left'>{t('home.groups.display')}</Divider>
          <NavButtonRow names={ROUTE_DISPLAY} go={go} t={t} />

          <Divider orientation='left'>{t('home.groups.chartsFiles')}</Divider>
          <NavButtonRow names={ROUTE_CHARTS_FILES} go={go} t={t} />

          <Divider orientation='left'>{t('home.groups.other')}</Divider>
          <NavButtonRow names={ROUTE_OTHER} go={go} t={t} />
        </Card>
      </div>
    )
  },
})

export { DemoHome }
export default DemoHome
