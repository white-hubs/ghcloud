import {
  BankOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  FolderOutlined,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutSider,
  Menu,
  MenuItem,
  NotificationOutlined,
  SubMenu,
  TeamOutlined,
  UserOutlined,
} from '@ghcloud/cube-ui'
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

/** 与常见「蓝顶栏 + 白侧栏」后台一致的演示配色（对齐浅色 Menu 选中态） */
const shellHeightPx = 560
const COLOR_TOP_NAV_BG = '#1677ff'
const COLOR_TOP_NAV_TEXT = '#ffffff'
const COLOR_SIDEBAR_BG = '#ffffff'
const COLOR_SIDEBAR_BORDER = '#f0f0f0'
const COLOR_INNER_HEADER_BG = '#ffffff'
const COLOR_CONTENT_BG = '#f5f5f5'
/** 侧栏一级菜单图标色（白底上略加深，避免与深色侧栏版混淆） */
const ICON_FOLDER = '#1677ff'
const ICON_PARK = '#389e0d'
const ICON_HR = '#08979c'
const ICON_CONSUMPTION = '#52c41a'
const ICON_ADMIN = '#006d75'
const ICON_MEETING = '#531dab'

/**
 * Batch-1 S08：Layout + Sider + Header + Content 与侧栏 Menu 的最小静态组合。
 * 侧栏结构对齐典型「内部管理」类系统（通知公告分组 + 若干一级菜单与图标），仅为静态展示。
 */
export const ShowcaseSceneS08 = defineComponent({
  name: 'ShowcaseSceneS08',
  setup: () => {
    const sceneMessages = {
      'zh-CN': {
        menuNoticeGroup: '通知公告',
        menuAnnouncementInfo: '公告信息',
        menuAnnouncementType: '公告类型',
        menuAnnouncementTag: '公告标签',
        menuPublisherOrg: '发布机构',
        menuKnowledge: '知识文档',
        menuPark: '园区管理',
        menuHr: '人事管理',
        menuConsumption: '消费管理',
        menuAdministration: '行政管理',
        menuMeetingRoom: '会议室管理',
        topNavTitle: '安全信息化系统 · 演示',
        headerBar: '内容顶栏（静态）',
        mainContentHint:
          '主内容区：与示例侧栏对应（通知公告下的「公告信息」为选中态）；侧栏为静态演示，无真实路由。',
      },
      'en-US': {
        menuNoticeGroup: 'Notices',
        menuAnnouncementInfo: 'Announcements',
        menuAnnouncementType: 'Announcement types',
        menuAnnouncementTag: 'Announcement tags',
        menuPublisherOrg: 'Publishing organizations',
        menuKnowledge: 'Knowledge base',
        menuPark: 'Campus / park',
        menuHr: 'HR',
        menuConsumption: 'Consumption',
        menuAdministration: 'Administration',
        menuMeetingRoom: 'Meeting rooms',
        topNavTitle: 'Demo · Safety information system',
        headerBar: 'Inner header (static)',
        mainContentHint:
          'Main area: matches the sample sidebar (Announcements selected under Notices); sidebar is static demo only.',
      },
    }

    const { t } = useI18n({ inheritLocale: true, useScope: 'local', messages: sceneMessages })

    const iconStyle = (color: string): { color: string } => ({ color })

    return (): JSX.Element => (
      <Layout style={{ height: `${shellHeightPx}px`, overflow: 'hidden', background: COLOR_SIDEBAR_BG }}>
        <LayoutHeader
          style={{
            background: COLOR_TOP_NAV_BG,
            color: COLOR_TOP_NAV_TEXT,
            height: 48,
            lineHeight: '48px',
            paddingInline: 16,
            margin: 0,
          }}
        >
          {t('topNavTitle')}
        </LayoutHeader>
        <Layout style={{ flex: 1, minHeight: 0 }}>
          <LayoutSider
            width={220}
            theme='light'
            style={{
              overflow: 'auto',
              background: COLOR_SIDEBAR_BG,
              borderRight: `1px solid ${COLOR_SIDEBAR_BORDER}`,
            }}
          >
            <Menu
              mode='inline'
              theme='light'
              selectedKeys={['scene-s08-announcement-info']}
              openKeys={['scene-s08-notice']}
              style={{ borderInlineEnd: 'none', background: COLOR_SIDEBAR_BG }}
            >
              <SubMenu
                eventkey='scene-s08-notice'
                icon={<NotificationOutlined style={iconStyle('#595959')} />}
                title={t('menuNoticeGroup')}
              >
                <MenuItem eventkey='scene-s08-announcement-info'>{t('menuAnnouncementInfo')}</MenuItem>
                <MenuItem eventkey='scene-s08-announcement-type'>{t('menuAnnouncementType')}</MenuItem>
                <MenuItem eventkey='scene-s08-announcement-tag'>{t('menuAnnouncementTag')}</MenuItem>
                <MenuItem eventkey='scene-s08-publisher-org'>{t('menuPublisherOrg')}</MenuItem>
              </SubMenu>
              <MenuItem eventkey='scene-s08-knowledge' icon={<FolderOutlined style={iconStyle(ICON_FOLDER)} />}>
                {t('menuKnowledge')}
              </MenuItem>
              <MenuItem eventkey='scene-s08-park' icon={<BankOutlined style={iconStyle(ICON_PARK)} />}>
                {t('menuPark')}
              </MenuItem>
              <MenuItem eventkey='scene-s08-hr' icon={<UserOutlined style={iconStyle(ICON_HR)} />}>
                {t('menuHr')}
              </MenuItem>
              <MenuItem eventkey='scene-s08-consumption' icon={<CreditCardOutlined style={iconStyle(ICON_CONSUMPTION)} />}>
                {t('menuConsumption')}
              </MenuItem>
              <MenuItem eventkey='scene-s08-admin' icon={<TeamOutlined style={iconStyle(ICON_ADMIN)} />}>
                {t('menuAdministration')}
              </MenuItem>
              <MenuItem eventkey='scene-s08-meeting' icon={<CalendarOutlined style={iconStyle(ICON_MEETING)} />}>
                {t('menuMeetingRoom')}
              </MenuItem>
            </Menu>
          </LayoutSider>
          <Layout style={{ minWidth: 0 }}>
            <LayoutHeader
              style={{
                background: COLOR_INNER_HEADER_BG,
                paddingInline: 16,
                lineHeight: '48px',
                height: 48,
                borderBottom: `1px solid ${COLOR_SIDEBAR_BORDER}`,
              }}
            >
              {t('headerBar')}
            </LayoutHeader>
            <LayoutContent style={{ margin: 16, padding: 16, background: COLOR_CONTENT_BG, overflow: 'auto' }}>
              {t('mainContentHint')}
            </LayoutContent>
          </Layout>
        </Layout>
      </Layout>
    )
  },
})
