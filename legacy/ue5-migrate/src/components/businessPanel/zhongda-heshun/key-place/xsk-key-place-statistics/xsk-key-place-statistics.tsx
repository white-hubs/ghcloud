import { defineComponent, ref, onMounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './xsk-key-place-statistics.module.less'
const ZD_SVG = '/resource/v1/ue5-migrate/components/businessPanel/zhongda-heshun/assets/svg'
const IconKeyPlace = `${ZD_SVG}/key-place.svg`
const IconRubbishStation = `${ZD_SVG}/rubbish-station.svg`
const IconPublicToilet = `${ZD_SVG}/public-toilet.svg`
const IconPublicInstitution = `${ZD_SVG}/public-institution.svg`
const IconPark = `${ZD_SVG}/park.svg`
const IconWorkStation = `${ZD_SVG}/work-station.svg`
import { Skeleton } from 'ant-design-vue'
import { cubeZDDataVizService } from '@/api/service'
import NoData from "@/components/businessPanel/public/noData.vue";
import { createKeyPlaceModal } from '../../utils/modal-helper'
import { showKeyPlaceMarker, showPersonMarker, showProjectMarker } from '../../utils/common'
import { findBestMatchingIcon } from '../../utils/icon-helper'
import { clearMap } from '@/pages/event/register/gis'
import { drawGeoJsonLayer } from '../../utils/gis-helper'
import { debounce } from '@/utils/common'
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";

/** 重点统计 */
export const XSKKeyPlaceStatistics = defineComponent({
  setup () {
    interface KeyPlaceListItem {
      name: string;
      value: number;
      icon: any;
      id?: string;
    }
    const keyPlaceList = ref<KeyPlaceListItem[]>([
      {
        name: '重点场所总数',
        value: 0,
        icon: IconKeyPlace
      },
      {
        name: '垃圾站',
        value: 0,
        icon: IconRubbishStation
      },
      {
        name: '公园',
        value: 0,
        icon: IconPark
      },
      {
        name: '政企单位',
        value: 0,
        icon: IconPublicInstitution
      },
      {
        name: '公厕',
        value: 0,
        icon: IconPublicToilet
      },
      {
        name: '工作站',
        value: 0,
        icon: IconWorkStation
      }
    ])
    const loading = ref(false)
    const getData = async (): Promise<void>=>{
      try {
        loading.value = true
        keyPlaceList.value = []
        const res = await cubeZDDataVizService.getKeyPlaceDistribution()
        if (res) {
          keyPlaceList.value = (res ?? []).map(item => {
            const url = item.icon ? (item.icon.path?.startsWith('http') ? item.icon.path : `${location.origin}${item.icon.path}`) : ''
            return {
              name: item.keyName,
              value: item.number,
              icon: findBestMatchingIcon(item.keyName),
              id: item.keyId as string ?? '',
            }
          })
          const total = (res ?? []).reduce((acc, cur) => acc + cur.number, 0)
          keyPlaceList.value.unshift({
            name: '重点场所总数',
            value: total || 0,
            icon: IconKeyPlace
          })
        }
      } catch {
      } finally {
        setTimeout(()=>{
          loading.value = false
        }, 500)
      }
    }
    onMounted(()=>{
      clearMap()  
      getData()
      showKeyPlaceMarker()
      drawGeoJsonLayer()
      // showPersonMarker()
      // showProjectMarker()
    })
    const handleValueCurrent = async (item: KeyPlaceListItem): Promise<void> => {
      createKeyPlaceModal(item.name, { dataTypeName: item.name })
    }
    const handleTitleCurrent = debounce(async (item: KeyPlaceListItem): Promise<void> => {
      clearMap()
      await showKeyPlaceMarker({ dataTypeId: item.id })
      drawGeoJsonLayer()
    },300)
    return (): JSX.Element => (
      <SubPanelTemplate titleFontSize="22px">
        <Skeleton loading={loading.value} active>
          <div class={styles['zd-key-place']}>
            {keyPlaceList.value?.length === 0 && <NoData />}
            {
              keyPlaceList.value.map((item) => (
                <div class={styles['item']} key={item.name} >
                  <div class={styles['label']} onClick={async () => handleTitleCurrent(item)}>
                    <img src={item.icon} alt="icon" class={styles['icon']} />
                    <span>{item.name}</span>
                  </div>
                  <div class={styles['value']} onClick={async () => handleValueCurrent(item)}>
                    <CountTo startVal={0} endVal={item.value} duration={2000} separator=""></CountTo>
                    <span class={styles['unit']}>个</span>
                  </div>
                </div>
              ))
            }
          </div>
        </Skeleton>
      </SubPanelTemplate>
    )
  },
})