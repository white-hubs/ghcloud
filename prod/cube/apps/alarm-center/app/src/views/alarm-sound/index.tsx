import { defineComponent, onMounted, ref } from 'vue'
import { Layout, AliasTable } from '@ghcloud/generic-component'
import { Button, PopOver } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { cubeAlarmCenterService } from '@/api/service'
import type { AlarmLevel, AlarmLevelPlayConfigVO } from '@ghcloud/cube-alarm-center-service/src/types/alarm-center'
import { useRoute } from 'vue-router'
import { SoundModal } from './components/sound-modal'

type SoundConfig = (AlarmLevel & AlarmLevelPlayConfigVO)
export const AlarmSoundConfig = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')

    const loading = ref(false)
    const dataSource = ref<SoundConfig[]>([])
    const soundModalRef = ref<{ openImportModal: (record: SoundConfig) => void; }>()
    const columns = [
      {
        dataIndex: 'name',
        title: '报警级别',
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        dataIndex: 'playNum',
        title: '播放次数',
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        dataIndex: 'looped',
        title: '是否循环播放',
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: boolean; }): JSX.Element=> {
          const textVal = text ? '是' : '否'
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        dataIndex: 'sound',
        title: '报警音频',
        width: 180,
        ellipsis: true,
        customRender: ({ record }: { record: AlarmLevelPlayConfigVO; }): JSX.Element => {
          const textVal = record?.file?.name
          return (
            <PopOver content={textVal}>
              <span>{textVal || '--'}</span>
            </PopOver>
          )
        },
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 180,
        ellipsis: true,
        customRender: ({ record }: { record: SoundConfig; }): JSX.Element => {
          return (
            <>
              <div class='table-actions'>
                <Button type='link' onClick={() => {
                  handleSoundModal(record)
                }}>
                  配置音频
                </Button>
                {record?.file && (
                  <Button type='link' onClick={() => {
                    handlePlay(record)
                  }}>
                    播放
                  </Button>
                )}
              </div>
            </>
          )
        }
      }
    ]
    // 事件处理函数
    const handleSoundModal = (record: SoundConfig): void => {
      soundModalRef.value?.openImportModal(record)
    }

    const handlePlay = (record: AlarmLevelPlayConfigVO): void => {
      let url = record?.file?.path ?? ''
      if (url && !url.includes('http')) {
        url = window.location.origin + url
      }
      if (/\.(mp3|mp4)$/i.test(url)) {
        window.open(url, '_blank')
      }
    }
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const levels = await cubeAlarmCenterService.getSatAlarmLevels()
        const configs = await cubeAlarmCenterService.getAlarmLevelPlayConfigList()
        const result = (levels ?? []).map(item => {
          const config = (configs ?? []).find(e => e.alarmLevelCode === item.code)
          return {
            ...item,
            ...config,
          }
        })
        dataSource.value = result as SoundConfig[]
      } catch {
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      getTableData()
    })
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <AliasTable
              rowKey='id'
              dataSource={dataSource.value}
              columns={columns}
              loading={loading.value}
              pagination={false}
              tableCode={tableCode}
              applicationCode={__ENV__.applicationCode}
            />
            <SoundModal ref={soundModalRef} onEnter={async () => getTableData()} />
          </>
        )
      },
    }
    return (): JSX.Element => (
      <div style={{ height: '100%' }}>
        <Layout title={pageTitle} v-slots={layoutSlots} />
      </div>
    )
  }
})
