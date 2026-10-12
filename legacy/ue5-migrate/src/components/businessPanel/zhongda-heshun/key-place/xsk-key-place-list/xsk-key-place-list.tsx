import { defineComponent, ref, onMounted } from 'vue'
import styles from "./xsk-key-place-list.module.less";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import { Button, Input, Popover, Skeleton } from 'ant-design-vue'
import NoData from "@/components/businessPanel/public/noData.vue";
import { cubeZDDataVizService } from '@/api/service'
import type { KeyPlacePageVO } from '@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto'
import { clearMap, setCenter } from '@/pages/event/register/gis'
import { createKeyPlaceMarker } from '../../utils/gis-helper'
import { ProjectSelect } from '../../components/project-select/project-select'
import { TypeSelect } from '../../components/type-select/type-select'

/** 重点场所列表 */
export const XSKKeyPlaceList = defineComponent({
  setup () {
    const columns = ref([
      {
        title: "场所名称",
        dataIndex: "placeName",
      },
      {
        title: "场所分类",
        dataIndex: "placeTypeName",
      },
      {
        title: "所属项目",
        dataIndex: "projectName",
      },
      {
        title: "操作",
        dataIndex: "operate",
        slots: {
          customRender: "operate",
        },
      },
    ]);
    const searchText = ref('')
    const typeId = ref(null)
    const operateSlots = {
      projectName: (e: { key: number;record: KeyPlacePageVO; }): string => {
        return e.record?.projectName || '--'
      },
      operate: (e: { key: number;record: KeyPlacePageVO; }): JSX.Element => {
        if (e.record?.latitude && e.record?.longitude) {
          return <div class={styles['operate-item']} style={{ color: '#5ea6ff' }} onClick={() => handlePosition(e.record)}>定位</div>
        } else {
          return <Popover content={'该场所未配置经纬度'}>
            <div class={styles['operate-item']} style={{ color: 'rgba(255, 255, 255, 0.5)', cursor: 'not-allowed' }}>定位</div>
          </Popover>
        }
      }
    }
    const handlePosition = (data: KeyPlacePageVO): void => {
      // clearMap()
      // createKeyPlaceMarker(data, { lat: data.latitude, lng: data.longitude }, true)
      setCenter({ lat: data.latitude, lng: data.longitude },20)
    }
    const list = ref<KeyPlacePageVO[]>([])
    const loading = ref(false)
    const projectId = ref('')
    const getData = async (): Promise<void>=>{
      try {
        loading.value = true
        const res = await cubeZDDataVizService.getKeyPlacesListAll({
          projectId: projectId.value,
          keyword: searchText.value,
          dataTypeId: typeId.value??'',
        })
        if (res) {
          list.value = res ?? []
        }
      } catch {
      } finally {
        setTimeout(()=>{
          loading.value = false
        }, 500)
      }
    }
    onMounted(()=>{
      getData()
    })
    const search = (): void => {
      getData()
    }
    return (): JSX.Element => (
      <SubPanelTemplate
        v-slots={{
          extra: () => (
            <ProjectSelect v-model:value={projectId.value} placeholder='请选择项目' width='150px' onChange={getData} />
          )
        }}
        titleFontSize="22px"
      >
        <div class={styles.search}>
            <Input   v-model:value={searchText.value} placeholder={'按场所名称搜索'}></Input>
            <TypeSelect v-model:value={typeId.value} placeholder='全部分类' width='200px'  />
            <Button type='primary' onClick={search}>查询</Button>
        </div>
        <Skeleton loading={loading.value} active paragraph={{ rows: 5 }}>
          <div class={styles['table-box']}>
            <RollTable column={columns.value} data={list.value} showLength={20} v-slots={operateSlots} />
          </div>
        </Skeleton>
      </SubPanelTemplate>
    )
  },
})