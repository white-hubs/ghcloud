import { CubeLayout } from '@ghcloud/cube-app-design'
import {
  Alert,
  Badge,
  Button,
  Calendar,
  Card,
  CardMeta,
  Col,
  Descriptions,
  DescriptionsItem,
  Divider,
  Empty,
  PopOver,
  Progress,
  Result,
  Row,
  Skeleton,
  Slider,
  Spin,
  Tag,
  TimeLine,
  TimeLineItem,
  Tooltip,
  TypographyText,
} from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const stack: Record<string, string> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  width: '100%',
}

export const ShowcaseDisplay = defineComponent({
  name: 'ShowcaseDisplay',
  setup: () => {
    const { pageTitle } = usePageName()
    const router = useRouter()
    const { t } = useI18n()
    const loading = ref(false)

    const slots = {
      'layout-header': (): JSX.Element => (
        <Button onClick={() => router.push({ name: 'demo-home' })}>返回首页</Button>
      ),
      'layout-content': (): JSX.Element => (
        <div style={stack}>
          <Card title={t('showcase.display.sectionTagBadge')}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              <Tag color='success'>成功</Tag>
              <Tag color='processing'>进行中</Tag>
              <Tag color='error'>失败</Tag>
              <Badge count={5}>
                <span style={{ display: 'inline-block', width: 42, height: 42, background: '#f0f0f0' }} />
              </Badge>
              <TypographyText type='secondary'>次要文字</TypographyText>
            </div>
          </Card>
          <Card title={t('showcase.display.sectionProgress')}>
            <Progress percent={30} />
            <Progress percent={70} status='exception' />
          </Card>
          <Card title={t('showcase.display.sectionDescriptions')}>
            <Descriptions bordered column={2} size='small'>
              <DescriptionsItem label='名称'>Showcase</DescriptionsItem>
              <DescriptionsItem label='类型'>演示</DescriptionsItem>
            </Descriptions>
          </Card>
          <Card title={t('showcase.display.sectionSpinSkeletonEmpty')}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Spin spinning={loading.value} />
              <Button size='small' onClick={() => (loading.value = !loading.value)}>
                {t('showcase.display.toggleSpin')}
              </Button>
            </div>
            <Divider />
            <Skeleton loading paragraph={{ rows: 2 }} active title />
            <Divider />
            <Empty description='暂无数据' />
          </Card>
          <Card title={t('showcase.display.sectionResult')}>
            <Result status='success' title={t('showcase.display.resultTitle')} sub-title={t('showcase.display.resultSubTitle')} />
          </Card>
          <Card title={t('showcase.display.sectionCardMeta')} style={{ maxWidth: 360 }}>
            <Card cover={<div style={{ height: 120, background: 'linear-gradient(135deg,#667eea,#764ba2)' }} />}>
              <CardMeta title='卡片标题' description='CardMeta 用于图文摘要' />
            </Card>
          </Card>
          <Row gutter={16}>
            <Col span={12}>
              <Card size='small'>{t('showcase.display.colGridCard')}</Card>
            </Col>
            <Col span={12}>
              <Card size='small'>{t('showcase.display.colGridCard')}</Card>
            </Col>
          </Row>
          <Card title={t('showcase.display.sectionAlertTooltipPopOver')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Alert message='提示信息' type='info' showIcon />
              <Tooltip title='气泡提示内容'>
                <Button>悬停看 Tooltip</Button>
              </Tooltip>
              <PopOver v-slots={{ content: () => <div>PopOver 内容区</div> }} title='标题'>
                <Button>点击 PopOver</Button>
              </PopOver>
            </div>
          </Card>
          <Card title={t('showcase.display.sectionSlider')}>
            <Slider defaultValue={36} tooltipOpen={false} />
          </Card>
          <Card title={t('showcase.display.sectionTimeLine')}>
            <TimeLine>
              <TimeLineItem>步骤一完成</TimeLineItem>
              <TimeLineItem>步骤二进行中</TimeLineItem>
              <TimeLineItem color='gray'>步骤三待办</TimeLineItem>
            </TimeLine>
          </Card>
          <Card title={t('showcase.display.sectionCalendar')}>
            <Calendar fullscreen={false} />
          </Card>
        </div>
      ),
    }

    return (): JSX.Element => <CubeLayout title={pageTitle || 'Showcase · 展示'} v-slots={slots} showFooter={false} />
  },
})
