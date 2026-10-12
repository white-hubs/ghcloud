import { defineComponent, onMounted, ref, type VNode } from 'vue'
import './detail.less'
import { cubeDailyInspectionService } from '@/api/server'
import { useRoute } from 'vue-router'
import { PullRefresh } from 'vant'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

export const ScenePointDetail = defineComponent({
  setup () {
    const { id } = useRoute().query as { id: string; }

    const loading = ref(false)
    const dataInfo = ref()
    const getData = async (): Promise<void> => {
      try {
        const params = {
          id
        }
        loading.value = true
        const res = await cubeDailyInspectionService.getScenePointDetail(params)
        dataInfo.value = res
      } catch (error) {
      } finally {
        loading.value = false
      }
    }
    const onRefresh = (): void => {
      getData()
    }

    onMounted(() => {
      document.title = '现场点详情'
      getData()
    })
    return (): VNode=>
      <>
        <CubeNavBar showBack title='现场点详情' />
        <PullRefresh v-model={loading.value} onRefresh={onRefresh}>
          {
            !loading.value &&
            <div class='detail-wrap'>
              <div class='info'>
                <div class='content'>
                  <div class='item'>
                    <span class='label'>现场点名称</span>
                    <span class='value'>{dataInfo.value?.name || '--'}</span>
                  </div>
                  <div class='item'>
                    <span class='label'>编码</span>
                    <span class='value'>{dataInfo.value?.codeNum || '--'}</span>
                  </div>
                  <div class='item'>
                    <span class='label'>类型</span>
                    <span class='value'>{dataInfo.value?.typeName || '--'}</span>
                  </div>
                  <div class='item'>
                    <span class='label'>管理部门</span>
                    <span class='value'>{dataInfo.value?.depName || '--'}</span>
                  </div>
                  <div class='item'>
                    <span class='label'>所属区域</span>
                    <span class='value'>{dataInfo.value?.areaName || '--'}</span>
                  </div>
                  <div class='item'>
                    <span class='label'>详细地址</span>
                    <span class='value'>{dataInfo.value?.detailAddress || '--'}</span>
                  </div>
                  <div class='item'>
                    <span class='label'>定位</span>
                    <span class='value'>{dataInfo.value?.location || '--'}</span>
                  </div>
                </div>
              </div>
            </div>
          }
        </PullRefresh>
      </>
  }
})
