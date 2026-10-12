import { List, Empty, PullRefresh, Uploader } from 'vant'
import { defineComponent, reactive, ref } from 'vue'
import './qrcode-transfer.less'
import dayjs from 'dayjs'
import { cubeSecureEduService } from '@/api/server'
import { useRouter } from 'vue-router'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

interface SecureEduData {
  id: string;
  title: string;
  trainType: string;
  trainDate: string;
  trainDuration: string;
  numberOfParticipant: number;
  photoFiles: { path: string; }[];
  createBy: string;
  createTime: string;
}

/** 二维码中转页-安全教育列表页 */
export const SecureEduList = defineComponent({
  setup: () => {
    const router = useRouter()
    const entityId = router.currentRoute.value.query.entityId as string
    const dataSource = ref<SecureEduData[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10
    })
    const getData = async (): Promise<{ records: SecureEduData[]; total: number; }> => {
      const { records, total } = await cubeSecureEduService.getSafetyCultivatePage({
        objId: entityId,
        pageNumber: search.pageNumber,
        pageSize: search.pageSize
      })

      const data = records.map(e => {
        return {
          id: e.id,
          title: e.themeName,
          trainType: e.cultivateType === 'INSIDE' ? '内部培训' : '商户培训',
          trainDate: dayjs(e.cultivateDate).format('YYYY-MM-DD'),
          trainDuration: e.cultivateDuration ? '' + e.cultivateDuration : '--',
          numberOfParticipant: e.personNum ?? 0,
          photoFiles: e.photoFiles ?? [],
          createBy: e.createBy,
          createTime: e.createTime
        }
      })

      return {
        records: data,
        total
      }
    }

    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await getData()
        if (res.total <= search.pageSize) {
          finished.value = true
        }
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        if (!dataSource.value) {
          dataSource.value = []
        }
        if (search.pageNumber === 1) {
          dataSource.value = []
        }
        dataSource.value = [...dataSource.value, ...res.records]
      } catch {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }

    const onRefresh = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }

    return (): JSX.Element =>
      <>
        <CubeNavBar title='安全教育' showBack />
        <div style={{ background: '#f3f7fa', minHeight: '100vh', padding: '2vw 0' }}>
          <PullRefresh v-model={refreshing.value} onRefresh={onRefresh}>
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
              onLoad={onLoad}
            >
              {
                (dataSource.value && dataSource.value.length > 0) &&
                dataSource.value.map((item: SecureEduData) =>
                  <div class='secure-edu-cell-group' key={item.id}>
                    <div class='secure-edu-title'>{item.title}</div>
                    <div class='training-date'>培训日期：{item.trainDate}</div>
                    <div class='training-info'>
                      <div class='training-info-item'>
                        <div class='info-item-title'>培训类型</div>
                        <div class='info-item-value'>{item.trainType}</div>
                      </div>
                      <div class='training-info-item'>
                        <div class='info-item-title'>参与人数</div>
                        <div class='info-item-value'>{item.numberOfParticipant}</div>
                      </div>
                      <div class='training-info-item'>
                        <div class='info-item-title'>培训时长</div>
                        <div class='info-item-value'>{item.trainDuration}分钟</div>
                      </div>
                    </div>
                    <div class='scene-pics'>
                      <div class='scene-pics-title'>现场照片</div>
                      {item.photoFiles.length === 0 && <div style='text-align:center;font-size: 12px;color: #d1d1d1;'>暂无图片</div>}
                      {item.photoFiles.length > 0 &&
                        <Uploader
                          show-upload={false}
                          deletable={false}
                          modelValue={item.photoFiles.map(e => {
                            return { url: e.path, isImage: true }
                          })}
                        />}
                    </div>
                    <div class='user-date'>
                      <div class='user-date-name'>{item.createBy}</div>
                      <div>上传时间：{dayjs(item.createTime).format('YYYY-MM-DD HH:mm')}</div>
                    </div>
                  </div>)
              }
              {(dataSource.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
            </List>
          </PullRefresh>
        </div>
      </>
  }
})
