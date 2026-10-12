import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { defineComponent, onMounted, ref } from 'vue'
import styles from './temporary-patrol-details.module.less'
import { Divider, Grid, GridItem } from 'vant'
import { useRoute } from 'vue-router'
import { cubeSmallEngineeringService } from '@/api/server'
import type { TemporaryPatrolRecordVO } from '@ghcloud/cube-small-engineering-service'
import { showImagePreview } from '@ghcloud/cube-utils'
import { Image } from 'vant'
import dayjs from 'dayjs'

export const TemporaryPatrolDetails = defineComponent({
  setup: () => {
    const { id } = useRoute().query as { id: string; }
    const data = ref<TemporaryPatrolRecordVO | undefined>()

    const getBaseInfo = async (): Promise<void> => {
      try {
        data.value = await cubeSmallEngineeringService.temporaryPatrolDetails(id)
      } catch {
      }
    }
    onMounted(() => {
      getBaseInfo()
    })

    const resultType = (result: string): string => {
      switch (result) {
        case 'NORMAL':
          return '正常'
        case 'ABNORMAL':
          return '异常'
        default:
          return '--'
      }
    }

    const resultTagColor = (result: string): string => {
      switch (result) {
        case 'NORMAL':
          return 'green'
        case 'ABNORMAL':
          return 'red'
        default:
          return 'gray'
      }
    }

    const perView = (item: { id: string; path: string; }): void => {
      const imgList = data.value?.imageFiles.filter(f => f.path) || []
      const index = imgList.findIndex(f => f.id === item.id) ?? 0
      showImagePreview(imgList.map(f => f.path), index)
    }

    return (): JSX.Element => {
      return (
        <div>
          <CubeNavBar title='临时巡查详情' showBack />
          <div class={styles['cell-group']}>
            <div class={styles.title}>巡检信息</div>
            <Divider />
            <div class={styles.content}>
              <div><span>巡检对象：</span><span style={{ color: 'black' }}>{data.value?.projectName}</span></div>
              <div><span>巡检人员：</span><span style={{ color: 'black' }}>{data.value?.userName}</span></div>
              <div><span>巡检时间：</span><span style={{ color: 'black' }}>{data.value?.completeTime ? dayjs(data.value?.completeTime).format('YYYY-MM-DD HH:mm') : '--'}</span></div>
              <div><span>巡检结果：</span><span style={{ color: resultTagColor(data.value?.result ?? '') }}>{resultType(data.value?.result ?? '')}</span></div>
              <div><span>描述：</span><span style={{ color: 'black' }}>{data.value?.remarks}</span></div>
              <div>
                <span>附件：</span>
                <Grid columns={4} gap={10}>
                  {data.value?.imageFiles.map(x =>
                    <GridItem>
                      <div key={x.id} onClick={() => {
                        perView(x)
                      }}>
                        <Image src={x.path} alt='' width='50' height='50' />
                      </div>
                    </GridItem>)}
                </Grid>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
})