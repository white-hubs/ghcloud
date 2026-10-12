import { CubeLayout } from '@ghcloud/cube-app-design'
import { Alert, Card, TypographyText } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

const contentStack: Record<string, string> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  width: '100%',
}

/**
 * Batch-4 S69：`CubeLayout` + `Alert` + `Card` / `TypographyText` 静态说明：远程选人、OA 选人由业务应用集成；本模板不含 X6；按需再进入 `demo-list`，本场景无路由。
 */
export const ShowcaseSceneS69 = defineComponent({
  name: 'ShowcaseSceneS69',
  setup: () => {
    const { pageTitle } = usePageName()
    const titleFallback = 'Showcase · S69 选人与模板边界'

    const slots = {
      'layout-content': (): JSX.Element => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <Alert
            type='info'
            showIcon
            message='集成边界'
            description='远程选人、OA 选人能力应在具体业务应用中对接与集成；标准模板仅保留通用壳与示例，不在此处内嵌选人组件或 OA 协议。'
          />
          <Card title='说明文档（静态）'>
            <div style={contentStack}>
              <TypographyText strong style={{ display: 'block' }}>
                远程选人 / OA 选人
              </TypographyText>
              <TypographyText style={{ display: 'block' }}>
                选人数据源、鉴权、回调与 UI 形态与租户和业务域强相关，请在业务 Cube 应用或插件中实现；复制本模板时按需接入对应 BFF 与前端组件，勿期望模板仓库自带完整选人链路。
              </TypographyText>
              <TypographyText strong style={{ display: 'block' }}>
                与 X6 的关系
              </TypographyText>
              <TypographyText style={{ display: 'block' }}>
                本标准模板<strong>不包含</strong> AntV X6 或流程图编排依赖；若项目需要 DAG/流程编辑，请在业务侧单独引入并维护版本，避免与模板基线混绑。
              </TypographyText>
              <TypographyText strong style={{ display: 'block' }}>
                demo-list 与路由约定
              </TypographyText>
              <TypographyText style={{ display: 'block' }}>
                列表类演示路由（如 <code>demo-list</code>）仅在确有必要联调或对照行为时使用；本批场景默认<strong>仅静态文档</strong>、不挂 <code>router-link</code>，与 Batch 场景约定一致。
              </TypographyText>
              <TypographyText type='secondary' style={{ display: 'block' }}>
                需要对照列表页时，由菜单或外部入口进入即可，无需在本页跳转。
              </TypographyText>
            </div>
          </Card>
        </div>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || titleFallback} v-slots={slots} showFooter={false} />
    )
  },
})
