import { defineComponent, onMounted, ref } from 'vue'
import { Descriptions, DescriptionsItem, Spin, PhoneOutlined, Empty } from '@ghcloud/cube-ui'
import { Layout } from '@/components/layout/layout'
import { usePageName } from '@/hook/use-page-name'
import { cubeDictionaryService } from '@/api/service'
import { OperateRoomDictionaryKey } from '@/api/dictionary-key'

/** 在线求助 */
export const OnLineHelp = defineComponent({
  setup: () => {
    const { title: pageTitle } = usePageName()
    const loading = ref(false)
    const dictionaryInfo = ref<{ title: string;value: string[]; }[]>([])
    const getInfo = async (): Promise<void> => {
      const res = await cubeDictionaryService.getDictionaryByItem({ itemCode: OperateRoomDictionaryKey.OPERATING_ONLINE_HELP_SET })
      if (res.length > 0) {
        const data = res[0]
        dictionaryInfo.value = data.variable ? JSON.parse(data.variable) : {}
      }
    }

    onMounted(async () => {
      getInfo()
    })
    const titleSlots = {
      title: (): JSX.Element => {
        return (
          <div>
            如有问题请直接联系运营方<PhoneOutlined style='font-size: 18px;margin: 3px;' />
          </div>
        )
      }
    }
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Spin spinning={loading.value}>
              <Descriptions v-slots={titleSlots} layout='vertical' bordered={dictionaryInfo.value?.length > 0} style='margin-top: 20px'>
                {
                  dictionaryInfo.value?.map((item) => {
                    return (
                      <DescriptionsItem label={item.title} key={item.title}>
                        {item.value && item.value.length > 0 && item.value.map((v) => {
                          return <div key={v}>{v}</div>
                        })}
                      </DescriptionsItem>
                    )
                  })
                }
              </Descriptions>
              {
                dictionaryInfo.value?.length === 0 && <Empty description='暂无数据' />
              }
            </Spin>
          </>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <Layout title={pageTitle ?? '在线求助'} v-slots={layoutSlots} />
      </>
  }
})
