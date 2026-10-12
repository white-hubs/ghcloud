import { Button, Col, Empty, Input, message, Modal, Row, Space, Spin } from '@ghcloud/cube-ui'
import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { CubeMapLeaflet } from '@ghcloud/cube-map-plugins'
import { authStore } from '@/api/auth-store'
import styles from './map-component.module.less'
import mitt from 'mitt'
import { debounce } from 'lodash'
function generateUUID (): string {
  let d = new Date().getTime()
  const uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
  return uuid
}

const emitter = mitt()

export const MapComponent = defineComponent({
  props: {
    disable: {
      type: Boolean,
      default: false
    },
  },
  setup (props, { expose }){
    let cubeMap: CubeMapLeaflet | null = null
    let polyline: L.Polyline | null = null
    const visible = ref(true)
    const handleCancel = (): void => {
      visible.value = false
      // emitter.emit('close', initialData)
      // if (cubeMap) {
      //   cubeMap.destroy()
      // }
    }
    const handleOk = (): void => {
      if (dataList.value.length < 3){
        message.warn('请选择至少3个位置')
        return
      }
      visible.value = false
      emitter.emit('close', dataList.value.map(e=>{
        return {
          lng: e.lng,
          lat: e.lat,
          address: e.address,
        }
      }))
    }
    const handleLocation = async (): Promise<void> => {
      if (!address.value) {
        message.warn('请输入位置信息')
        return
      }
      if (cubeMap) {
        try {
          btnLoading.value = false
          const res = await cubeMap.getLntLatByAddress(address.value)
          cubeMap.setCenter(res.lng, res.lat)
        } catch {
          message.error('定位失败')
        } finally {
          btnLoading.value = false
        }
      }

    }
    const dataList = ref<{
      lng: number;
      lat: number;
      address: string;
      id: string;
      marker: L.Marker | null;
    }[]>([])
    let initialData: {
      lng: number;
      lat: number;
      address: string;
    }[] = [];

    const mapLoading = ref(true)
    const btnLoading = ref(false)
    const address = ref()
    let mapLoadStatus = false

 

    // 批量标记管理
    const markerMap = new Map<string, L.Marker>()
    const pendingMarkers = new Set<string>()

    /**
     * 批量更新地图标记和连线
     */
    const updateMap = async (): Promise<void> => {
      if (!cubeMap || !mapLoadStatus) {
        return
      }
    
      // 批量处理标记
      const markersToAdd: Array<{
        id: string
        lng: number
        lat: number
      }> = []
    
      dataList.value.forEach(item => {
        if (!markerMap.has(item.id) && !pendingMarkers.has(item.id)) {
          markersToAdd.push(item)
          pendingMarkers.add(item.id)
        }
      })
    
      // 批量添加标记
      if (markersToAdd.length > 0) {
        await Promise.all(
          markersToAdd.map(async item => {
            try {
              const marker = await cubeMap!.addMarker({
                iconSize: [19, 31.5],
                position: {
                  lng: item.lng,
                  lat: item.lat
                }
              })
              markerMap.set(item.id, marker)
              // 更新 dataList 中的 marker 引用
              const dataItem = dataList.value.find(d => d.id === item.id)
              if (dataItem) {
                dataItem.marker = marker
              }
            } catch (error) {
            } finally {
              pendingMarkers.delete(item.id)
            }
          })
        )
      }
    
      // 移除不需要的标记
      const currentIds = new Set(dataList.value.map(item => item.id))
      for (const [id, marker] of markerMap.entries()) {
        if (!currentIds.has(id)) {
          marker.remove()
          markerMap.delete(id)
        }
      }
    
      // 更新连线
      updatePolyline()
    
      // 设置地图中心
      if (dataList.value.length > 0) {
        cubeMap.setCenter(dataList.value[0].lng, dataList.value[0].lat)
      }
    }
    
    /**
     * 独立的连线更新函数
     */
    const updatePolyline = (): void => {
      if (polyline) {
        polyline.remove()
        polyline = null
      }
    
      if (dataList.value.length > 2) {
        const points = dataList.value.map(item => ({
          lng: item.lng,
          lat: item.lat
        }))
        
        // 闭合连线
        points.push({
          lng: dataList.value[0].lng,
          lat: dataList.value[0].lat
        })
        
        polyline = cubeMap!.createPolyline(points)
      }
    }

    watch(()=>dataList.value, ()=>{
      debouncedUpdateMap()
    }, { deep: true })
    watch(()=>props.disable, ()=>{
      debouncedUpdateMap()
    }, { deep: true })
    // 添加防抖的更新函数
    const debouncedUpdateMap = debounce(updateMap, 100)
    const renderMapWithRetry = async (mapId: string, maxRetries = 3, retryDelay = 1000): Promise<boolean> => {
      let retries = 0;

      while (retries < maxRetries) {
        try {
          await cubeMap?.renderMap(mapId);
          return true; // 渲染成功
        } catch (error) {
          retries++;

          if (retries >= maxRetries) {
            return false; // 达到最大重试次数，返回失败
          }

          // 等待一段时间后重试
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }

      return false; // 不应该到达这里，但为了类型安全
    }
    onMounted(async ()=>{
      if (!mapLoadStatus) {
        cubeMap = new CubeMapLeaflet(authStore)
        const renderSuccess = await renderMapWithRetry('listCubeMapDetailContainer');
        if (renderSuccess) {
          mapLoadStatus = true
          cubeMap.registerMapClickEvent()
        } else {
          // 处理渲染失败的情况
          message.error('地图渲染失败，请刷新页面重试');
          mapLoading.value = false
        }


        mapLoading.value = false
      }
      debouncedUpdateMap()
    })

    onBeforeUnmount(()=>{
      if (cubeMap) {
        cubeMap.destroy()
      }
    })
    expose({
      open: async (list?: typeof initialData)=>{
        initialData = list ?? []
        try {
          cubeMap?.clearMap()
        } catch {

        }
        dataList.value = initialData.map(e=>{
          return {
            ...e,
            marker: null,
            id: generateUUID()
          }
        })
        visible.value = true
        return new Promise((resolve) => {
          emitter.on('close', (data)=>{
            resolve(data)
            emitter.off('close')
          })
        })
      }
    })

    return (): JSX.Element =>
      <Modal
        visible={visible.value}
        title={'项目覆盖范围'}
        width={'1400px'}
        onOk={handleOk}
        onCancel={handleCancel}
        okText='确定'
        cancelText='取消'
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <Input v-model:value={address.value} maxlength={999} placeholder='请输入位置信息' style={{ width: '400px' }} />
          <Button type='primary' onClick={handleLocation} loading={btnLoading.value}>定位</Button>
        </div>

        <Spin size='large' tip='地图渲染中' spinning={mapLoading.value}>
          <Row gutter={10}>
            <Col span={18}>
              <div id='listCubeMapDetailContainer' style={{ width: '100%', height: '500px', cursor: 'unset !important' }} />
            </Col>
            <Col span={6}>
              <div class={styles['data-list']}>
                {
                  dataList.value.map((e, i)=>{
                    return <div key={e.id} class={styles['item']}>
                      <div class={styles['index']}>{i + 1}.</div>
                      <div class={styles['address']}>{e.address}</div>
                      <div class={styles['close']}>
                        <Space>
                          <Button type='link' onClick={()=>{
                            cubeMap?.setCenter(e.lng, e.lat)
                          }}>
                            定位到中心
                          </Button>

                        </Space>
                      </div>
                    </div>
                  })
                }
                {
                  dataList.value.length === 0 && <Empty description='请点击左侧地图区域添加位置' />
                }
              </div>
            </Col>
          </Row>
        </Spin>
      </Modal>
  }
})