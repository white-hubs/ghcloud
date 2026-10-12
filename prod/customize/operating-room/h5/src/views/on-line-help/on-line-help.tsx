import { computed, defineComponent, onMounted, ref } from 'vue'
import './on-line-help.less'
import { Button, Image, Popup } from 'vant'
import { cubeDictionaryService } from '@/api/server'
import { OperateRoomDictionaryKey } from '@/api/dictionary-key'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'

export const OnLineHelp = defineComponent({
  setup: () => {
    document.title = '在线求助'
    const img = '/resource/v1/operating-room/call.png'
    const show = ref(false)
    const handleCall = (phoneNumber: string): void => {
      cubeAppService.callPhone(phoneNumber)
    }
    // const loading = ref(false)
    const dictionaryInfo = ref<{ title: string;value: string[]; }[]>([])
    const getInfo = async (): Promise<void> => {
      const res = await cubeDictionaryService.getDictionaryByItem({ itemCode: OperateRoomDictionaryKey.OPERATING_ONLINE_HELP_SET })
      if (res.length > 0) {
        const data = res[0]
        dictionaryInfo.value = data.variable ? JSON.parse(data.variable) : {}
      }
    }
    const phoneNumberList = computed(() => {
      const list = dictionaryInfo.value.map(item => item.value).flat()
      return [...new Set(list)]
    })

    onMounted(async () => {
      getInfo()
    })
    return (): JSX.Element=>
      <div class='detail-page'>
        <Image src={img} class='img' />
        <div class='title'>如有问题请直接联系运营方</div>
        {
          dictionaryInfo.value?.map((item, i) => {
            return (
              <div key={item.title}>
                <div class={['time', i > 0 ? 'other' : '']}>{item.title}</div>
                {item.value && item.value.length > 0 && item.value.map((v) => {
                  return <div key={v} class='tel'>{v}</div>
                })}
              </div>
            )
          })
        }
        {
          dictionaryInfo.value?.length > 0 && <Button type='primary' block class='btn' onClick={() => {
            show.value = true
          }}>拨打电话</Button>
        }
        <Popup
          v-model:show={show.value}
          position='bottom'
        >
          <div class='call-list'>
            {
              phoneNumberList.value.map((item: string) =>
                <div class='number' onClick={() => {
                  handleCall(item)
                }}>{item}</div>)
            }
            <div class='cancel' onClick={() => {
              show.value = false
            }}>取消</div>
          </div>
        </Popup>
      </div>
  }
})
