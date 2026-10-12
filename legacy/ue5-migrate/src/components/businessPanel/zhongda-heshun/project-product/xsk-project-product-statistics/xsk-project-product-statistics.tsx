import { defineComponent, ref, onMounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './xsk-project-product-statistics.module.less'
const ZD_SVG = '/resource/v1/ue5-migrate/components/businessPanel/zhongda-heshun/assets/svg'
const IconKeyPlace = `${ZD_SVG}/key-place.svg`
const IconRubbishStation = `${ZD_SVG}/rubbish-station.svg`
const IconPublicToilet = `${ZD_SVG}/public-toilet.svg`
const IconPublicInstitution = `${ZD_SVG}/public-institution.svg`
const IconPark = `${ZD_SVG}/park.svg`
const IconWorkStation = `${ZD_SVG}/work-station.svg`
import { Button, Skeleton } from 'ant-design-vue'
import { cubeZDDataVizService } from '@/api/service'
import NoData from "@/components/businessPanel/public/noData.vue";
import { createKeyPlaceModal } from '../../utils/modal-helper'
import { showKeyPlaceMarker, showPersonMarker, showProjectMarker } from '../../utils/common'
import { findBestMatchingIcon } from '../../utils/icon-helper'
import { clearMap } from '@/pages/event/register/gis'
import { drawGeoJsonLayer } from '../../utils/gis-helper'
import { debounce } from '@/utils/common'
const IconUser = `${ZD_SVG}/user.svg`
import { ProgressBar } from '../../components/progress-bar/progress-bar'
import { ProjectProductStatisticsVO } from '@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto'
import { BaseModal } from '@/pages/widget/modal/base-modal/base-modal'



/** 产品统计 */
export const XSKProjectProductStatistics = defineComponent({
  setup () {
 
    const dataList = ref<ProjectProductStatisticsVO[]>([])
    const visible = ref(false)
    const total = ref(0)
    const loading = ref(false)
    const getData = async (): Promise<void>=>{
      try {
        loading.value = true

        const res = await cubeZDDataVizService.getProjectProductCount()
        if (res) {
          total.value = res
        }
      } catch {
      } finally {
          loading.value = false
      }
    }    
    const getListData = async (): Promise<void>=>{
      try {
        loading.value = true

        const res = await cubeZDDataVizService.getProjectProductTypeCount()
        if (res) {
          dataList.value = res
        }
      } catch {
      } finally {
          loading.value = false
      }
    }
    onMounted(()=>{
      getData()
      getListData()
    })

    return (): JSX.Element => (
      <SubPanelTemplate v-slots={{
          extra: () => (
            <Button type='link' size='small' style={{ color: '#b0c5ff', fontSize: '18px' }}  onClick={()=>{
              visible.value = true
            }}>更多&gt;&gt;</Button>
          )
        }}
         titleFontSize="22px"
        >
        <Skeleton loading={loading.value} active>
          <div class={styles['user-static']} >
            <div class={styles['label']}>
              <img src={IconUser} />
              产品总数
            </div>
            <div class={styles['value']}>
              {total.value}
              <span class={styles['unit']}>个</span>
            </div>
          </div>
          <div class={styles.scroll}>
            {dataList.value?.length === 0 && <NoData />}
            {
              dataList.value.map((item) => (
                <div class={styles.item} key={item.productType}>
                  <ProgressBar total={total.value} label={item.productType} value={item.count}  />
                </div>
              ))
            }
          </div>
        </Skeleton>
        <BaseModal
          v-model:visible={visible.value}
          title={'产品列表'}
          size="large"
          style={{width: '1000px'}}
          // width={'1000px'}
          onClose={() => {
            // emit('close')
          }}
        >
          <div class={styles.modelScroll}>
          {dataList.value?.length === 0 && <NoData />}
            {
              dataList.value.map((item) => (
                <div class={styles.item} key={item.productType}>
                  <ProgressBar total={total.value} label={item.productType} value={item.count}  />
                </div>
              ))
            }
            </div>
        </BaseModal>
      </SubPanelTemplate>
    )
  },
})