import { defineComponent, onMounted, reactive } from 'vue'
import { Layout } from '@ghcloud/generic-component'
import './market-auth.less'
import { Button, FormItem, Switch, message } from '@ghcloud/cube-ui'
import { deleteClient, generate, getClient, setClient } from '@/api/market-auth'
import { usePageName } from '@ghcloud/cube-utils'

export const MarketAuth = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    interface Enterprise {
      name: string;
    }
    const getInfo = async (): Promise<void> => {
      await generate()
      message.success('生成成功')
      getDate()
    }
    const datainfo = reactive<{
      code: string;
      secretPlain: string;
      scopes: string;
    }>({
      code: '',
      secretPlain: '',
      scopes: ''
    })
    const getDate = async (): Promise<void> => {
      const { data } = await getClient()
      Object.assign(datainfo, data)
    }
    onMounted(async () => {
      getDate()
    })
    const copy = (writeText: string): void => {
      const input = document.createElement('input') // 创建input对象
      // 获取需要复制文字的容器
      input.value = writeText // 设置复制内容
      document.body.appendChild(input) // 添加临时实例
      input.select() // 选择实例内容
      document.execCommand('Copy') // 执行复制
      document.body.removeChild(input) // 删除临时实例
      message.success('复制成功')
    }

    const authList = [
      { check: false, name: '安全报警:', value: 'alarm_manage' },
      { check: false, name: '设备管理:', value: 'device_manage' },
      { check: false, name: '巡检管理:', value: 'inspect_manage' },
      { check: false, name: '电子巡更:', value: 'electronlc_patrol' },
      { check: false, name: '隐患排查:', value: 'hidden_danger' },
      { check: false, name: '风险源管理:', value: 'risk_source' },
      { check: false, name: '小散工程:', value: 'loose_work' },
      { check: false, name: '安全教育:', value: 'safety_education' },
      { check: false, name: '预案文件:', value: 'emergency_files' },
      { check: false, name: '安防监控:', value: 'safety_vmoniotr' },
    ]
    const switchChange = async (value: string): Promise<void> => {
      if (datainfo.code === '' || datainfo.code === null) {
        message.success('请生成授权信息')
        return
      }
      const isHave = datainfo.scopes.split(',').includes(value)
      if (isHave) {
        await deleteClient(datainfo.code, value)
      } else {
        await setClient(datainfo.code, value)
      }
      message.success('操作成功')
      getDate()
    }
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <div style='margin-top:20px'>
              <div class='title'>授权信息</div>
              <div class='basic'>
                <FormItem label='市场名称:'>
                  {(JSON.parse(sessionStorage.getItem('GH-NowEnterprise') ?? '') as Enterprise).name}
                  <Button type='primary' onClick={getInfo} size='small' style='margin-left:20px'>生成授权信息</Button>
                </FormItem>
              </div>
              <div class='basic'>
                <FormItem label='appid:'>
                  <span id='code'>{datainfo.code} </span> <Button type='link' onClick={() => {
                    copy(datainfo.code)
                  }}>复制</Button>
                  <input type='hidden' value={datainfo.code} id='code1' />
                </FormItem>
                <FormItem label='key'>
                  <span id='secretPlain'> {datainfo.secretPlain}</span> <Button type='link' onClick={() => {
                    copy(datainfo.secretPlain)
                  }}>复制</Button>
                  <input type='hidden' value={datainfo.secretPlain} id='secretPlain1' />
                </FormItem>
              </div>
              <div class='title'>数据授权</div>
              <div class='auth'>
                {
                  authList.map(item => {
                    item.check = datainfo.scopes.split(',').includes(item.value)
                    return (
                      <div key={item.name}>
                        <FormItem label={item.name}>
                          <Switch v-model:checked={item.check} onChange={async () => switchChange(item.value)} />
                        </FormItem>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          </>
        )
      }
    }
    return (): JSX.Element =>
      <Layout title={pageTitle} v-slots={layoutSlots} showFooter={false} class='market-auth' />
  }
})
