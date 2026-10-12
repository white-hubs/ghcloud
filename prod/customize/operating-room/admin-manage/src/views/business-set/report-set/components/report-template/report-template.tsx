import { defineComponent, ref } from 'vue'
import { Card, Space, PopOver, QuestionCircleOutlined } from '@ghcloud/cube-ui'
import { TemplateEditor } from '../template-editor/template-editor'
import { getDefaultTemplate } from '@ghcloud/cube-operating-room-service'
import { storeDetection } from '@/store/detection'

export const ReportTemplate = defineComponent({
  setup (props, { expose }) {
    const detectionStore = storeDetection()
    const content = ref('')
    content.value = detectionStore.company?.templateContent || getDefaultTemplate()
    if (!detectionStore.company?.templateContent?.includes('检测')){
      content.value = getDefaultTemplate()
    }
    const toolbarConfig = {
      excludeKeys: [
        'group-video', // 排除视频
        'insertImage', // 排除图片
        'codeBlock', // 排除代码块
        'bold', // 排除加粗
        'fontFamily', // 排除字体设置
        'italic', // 排除斜体
        'fontSize', // 排除字号设置
        'lineHeight', // 排除行高设置
        'todo', // 排除待办设置
        'through', // 排除删除线
        'code', // 排除行内代码
        'sup', // 排除上标
        'sub', // 排除下标
      ]
    }
    const getContent = (): string => {
      return content.value || getDefaultTemplate()
    }
    expose({
      getContent
    })
    return (): JSX.Element =>
      <>
        <Card bordered={false} style={{ padding: '0' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <PopOver
                placement="bottomRight"
                trigger="click"
                overlayClassName="usage-guide-popover"
                title={<div style={{ fontWeight: 'bold', fontSize: '16px' }}>模板变量使用说明</div>}
                content={
                  <div style={{ width: '340px', padding: '8px' }}>
                    <p>在编辑器中输入 <code>@</code> 符号可触发变量自动补全</p>
                    <p>使用键盘上下键选择变量，按 Enter 或 Tab 键插入</p>
                    {/* <p>变量格式为：<code>${'{变量名}'}</code>，例如：报告标题对应<code>${'{reportTitle}'}</code></p> */}
                    {/* <p>无效的变量会被标记出来，可以点击「检查模版变量」按钮查看详情</p> */}
                    {/* <p><strong>注意：</strong>内置动态数据（如检测公司、报告编号）会在生成报告时自动填充，无需在模板中手动设置这些值</p> */}
                  </div>
                }
              >
                <div style={{ cursor: 'pointer', color: '#1890ff', display: 'flex', alignItems: 'center' }}>
                  <QuestionCircleOutlined style={{ marginRight: '4px' }} />
                  <span>使用说明</span>
                </div>
              </PopOver>
            </div>
            <TemplateEditor
              v-model:value={content.value}
              height="500px"
              placeholder="请输入报告模板内容..."
              toolbarConfig={toolbarConfig}
              style={{ width: '100%' }}
            />
          </Space>
        </Card>
      </>
  }
})
