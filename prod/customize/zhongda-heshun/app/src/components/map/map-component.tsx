import { Button, Col, Empty, Input, message, Modal, Row, Space, Spin } from '@ghcloud/cube-ui'
import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { CubeMapLeaflet } from '@ghcloud/cube-map-plugins'
import { authStore } from '@/api/auth-store'
import styles from './map-component.module.less'
import mitt from 'mitt'
import { debounce } from 'lodash'

/**
 * 生成唯一标识符
 */
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
  setup (props, { expose }){
    let cubeMap: CubeMapLeaflet | null = null
    let polyline: L.Polyline | null = null
    const visible = ref(true)

    // 性能优化：添加批量操作标志
    let isBatchOperation = false

    const handleCancel = (): void => {
      visible.value = false
      emitter.emit('close', initialData)
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
          btnLoading.value = true
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

    /**
     * 优化后的地图更新函数 - 使用防抖和批量操作
     */
    const updateMap = debounce((): void => {
      if (isBatchOperation) return // 批量操作时跳过单次更新

      nextTick(() => {
        if (!cubeMap || !mapLoadStatus) {
          return
        }

        // 优化：只在需要时重新创建连线
        updatePolyline()
      })
    }, 100) // 100ms 防抖

    /**
     * 单独处理连线更新
     */
    const updatePolyline = (): void => {
      if (polyline) {
        polyline.remove()
        polyline = null
      }

      if (dataList.value.length > 2) {
        const points = dataList.value.map(e => ({
          lng: e.lng,
          lat: e.lat
        }))

        // 闭合路径
        points.push({
          lng: dataList.value[0].lng,
          lat: dataList.value[0].lat
        })

        polyline = cubeMap.createPolyline(points)
      }
    }

    /**
     * 批量添加标记点
     */
    const batchAddMarkers = async (): Promise<void> => {
      if (!cubeMap || !mapLoadStatus) return

      isBatchOperation = true

      // 清空现有标记
      cubeMap.clearMarkers()

      // 批量添加标记
      const markerPromises = dataList.value.map(async (item) => {
        if (!item.marker) {
          const marker = await cubeMap.addMarker({
            iconSize: [19, 31.5],
            position: {
              lng: item.lng,
              lat: item.lat
            },
          })
          item.marker = marker
        }
      })

      await Promise.all(markerPromises)

      // 更新连线
      updatePolyline()

      isBatchOperation = false
    }

    /**
     * 异步地址解析队列
     */
    const addressQueue = new Map<string, Promise<string>>()

    /**
     * 获取地址信息（带缓存）
     */
    const getAddressWithCache = async (lng: number, lat: number): Promise<string> => {
      const key = `${lng.toFixed(6)}_${lat.toFixed(6)}`

      if (addressQueue.has(key)) {
        return addressQueue.get(key) ?? ''
      }

      const addressPromise = cubeMap?.getAddressByLntLat(lng, lat)
        .then(res => res?.address ?? '')
        .catch(() => '地址解析失败')

      addressQueue.set(key, addressPromise)

      // 清理缓存（避免内存泄漏）
      setTimeout(() => {
        addressQueue.delete(key)
      }, 300000) // 5分钟后清理

      return addressPromise
    }

    // 优化：使用防抖监听数据变化
    watch(() => dataList.value.length, debounce(() => {
      if (!isBatchOperation) {
        updateMap()
      }
    }, 50), { flush: 'post' })

    const renderMapWithRetry = async (mapId: string, maxRetries = 3, retryDelay = 1000): Promise<boolean> => {
      let retries = 0;

      while (retries < maxRetries) {
        try {
          await cubeMap?.renderMap(mapId);
          return true;
        } catch (error) {
          retries++;

          if (retries >= maxRetries) {
            return false;
          }

          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }

      return false;
    }

    onMounted(async () => {
      if (!mapLoadStatus) {
        cubeMap = new CubeMapLeaflet(authStore)
        const renderSuccess = await renderMapWithRetry('listCubeMapContainer');

        if (renderSuccess) {
          mapLoadStatus = true
          cubeMap.registerMapClickEvent()
          cubeMap.setCenter(114.05946604762342, 22.543775390048342)

          // 优化：防抖处理点击事件
          const debouncedMapClick = debounce(async (event): Promise<void> => {
            try {
              // 先添加标记
              const marker = await cubeMap.addMarker({
                iconSize: [19, 31.5],
                position: {
                  lng: event.lng,
                  lat: event.lat
                },
              }) as L.Marker

              const data = {
                lng: event.lng,
                lat: event.lat,
                address: '地址解析中...', // 先显示占位文本
                id: generateUUID(),
                marker
              }

              dataList.value.push(data)

              // 异步解析地址
              getAddressWithCache(event.lng, event.lat).then(address => {
                data.address = address
              })

            } catch (error) {
              message.error('添加标记失败')
            }
          }, 200)

          cubeMap.onMapClick = debouncedMapClick
          mapLoading.value = false
        } else {
          message.error('地图渲染失败，请刷新页面重试');
          mapLoading.value = false
        }
      }

      await batchAddMarkers()
    })

    onBeforeUnmount(() => {
      if (cubeMap) {
        cubeMap.destroy()
      }
      // 清理缓存
      addressQueue.clear()
    })

    /**
     * 优化后的移除标记函数
     */
    const removeMarker = async (index: number): Promise<void> => {
      const item = dataList.value[index]
      if (item.marker) {
        item.marker.remove()
      }

      dataList.value.splice(index, 1)

      // 批量重新渲染
      await batchAddMarkers()
    }

    expose({
      open: async (list?: typeof initialData) => {
        initialData = list ?? []

        try {
          cubeMap?.clearMap()
        } catch {
          // 忽略清理错误
        }

        isBatchOperation = true

        dataList.value = initialData.map(e => ({
          ...e,
          marker: null,
          id: generateUUID()
        }))

        visible.value = true

        // 延迟批量渲染
        nextTick(() => {
          batchAddMarkers()
        })

        return new Promise((resolve) => {
          emitter.on('close', (data) => {
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
              <div id='listCubeMapContainer' style={{ width: '100%', height: '500px', cursor: 'unset !important' }} />
            </Col>
            <Col span={6}>
              <div class={styles['data-list']}>
                {
                  dataList.value.map((e, i) => {
                    return <div key={e.id} class={styles['item']}>
                      <div class={styles['index']}>{i + 1}.</div>
                      <div class={styles['address']}>{e.address}</div>
                      <div class={styles['close']}>
                        <Space>
                          <Button type='link' onClick={() => {
                            cubeMap?.setCenter(e.lng, e.lat)
                          }}>
                            定位到中心
                          </Button>
                          <Button type='link' danger onClick={async () => removeMarker(i)}>
                            移除
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