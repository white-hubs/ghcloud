import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Form, FormItem, Input, Row, Col, Button, message, InputNumber, TreeSelect } from '@ghcloud/cube-ui'
import { createArea, getAreaInfo, updateArea, getAreaListTree } from '@/apis/region-manage'
import { useRouter, useRoute } from 'vue-router'
import { logger } from '@/logger'
import { MapSelect } from '@/components/map-select/map-select'
import type { AreaVo } from '@/apis/region-manage'
import { getUsingLayerDetails } from '@/apis/layer-manage'
export const EditRegion = defineComponent({
  setup: () => {
    const router = useRouter()
    const route = useRoute()
    const mapRef = ref<{ getPoint: () => string; getZoom: () => string; }>()
    const formRef = ref<{ validate: () => Promise<void>; }>()
    const formRules = {
      name: [{ required: true, message: '请输入区域名称' }],
      zoom: [{ required: true, message: '请获取层级' }],
      coordinate: [{ required: true, message: '请获取区域中心坐标' }],
    }
    logger.info('route', route)
    const state = reactive<{
      areaOptions: AreaVo[];
      visible: boolean;
      layerInfo: {
        southwest: string;
        northeast: string;
        center: string;
        layerFile: string;
      };
      formData: {
        name: string;
        parentId: string;
        zoom: string;
        coordinate: string;
        sort: string;
      };
    }>({
      // 区域数据
      areaOptions: [],
      visible: false,
      layerInfo: {
        southwest: '',
        northeast: '',
        center: '',
        layerFile: ''
      },
      // 表单数据
      formData: {
        name: '',
        parentId: '',
        zoom: '',
        coordinate: '',
        sort: '',
      }
    })
    const getAreaTree = async (): Promise<void> => {
      const { data } = await getAreaListTree()
      state.areaOptions = data
    }
    const findById = (tree: AreaVo[], id: string): AreaVo | undefined => {
      // 深度遍历查找
      for (const node of tree) {
        if (node.id === id) {
          return node // 找到匹配的节点，返回它
        }
        if (node.children) {
          const found = findById(node.children, id)
          if (found) {
            return found // 在子节点中找到匹配的节点，返回它
          }
        }
      }
      return undefined // 如果没有找到，返回 undefined
    }
    const handleGetCoordinate = async (): Promise<void> => {
      route.query.id && await getAreaLayerInfo(route.query.id as string)
      state.visible = true
    }
    const getAreaLayerInfo = async (areaId: string): Promise<void> => {
      const { data } = await getUsingLayerDetails({
        areaId
      })
      if (!data) {
        const area = findById(state.areaOptions, areaId)
        area && getAreaLayerInfo(area.parentId as unknown as string)
      } else {
        state.layerInfo = {
          southwest: data.southwest,
          northeast: data.northeast,
          center: state.formData.coordinate,
          layerFile: data.layerFile
        }
      }
    }
    const getAreaInfoData = async (): Promise<void> => {
      if (route.query.id) {
        const { data } = await getAreaInfo(route.query.id as string)
        state.formData = data
      }
    }
    onMounted(() => {
      getAreaInfoData()
      getAreaTree()
    })
    const handleSubmit = async (): Promise<void> => {
      await formRef.value?.validate()
      !route.query.id ? await createArea(state.formData) : await updateArea(state.formData)
      message.success('保存成功')
      router.back()
    }
    const layoutSlots = {
      'content-table': (): JSX.Element => {
        return (
          <div style={{ padding: '20px 30px' }}>
            <Form
              ref={formRef}
              model={state.formData}
              rules={formRules}
            >
              <Row>
                <Col span={12}>
                  <FormItem label='区域名称' name='name'>
                    <Input v-model:value={state.formData.name} placeholder='请输入点位名称' />
                  </FormItem>
                  <FormItem label='区域地图缩放' name='zoom'>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Input v-model:value={state.formData.zoom} placeholder='请获取或区域地图缩放' />
                    </div>
                  </FormItem>
                  <FormItem label='排序' name='sort' style={{ width: '60%' }}>
                    <InputNumber v-model:value={state.formData.sort} max={999} placeholder='请输入排序0-999' />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label='父级区域' name='parentId'>
                    <TreeSelect fieldNames={{ label: 'name', value: 'id' }} v-model:value={state.formData.parentId} allow-clear tree-data={state.areaOptions} placeholder='请选择父级区域' />
                  </FormItem>
                  <FormItem label='区域中心坐标' name='coordinate'>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <Input v-model:value={state.formData.coordinate} maxlength={9999} showCount={false} placeholder='请输入点位名称' />
                      <Button type='primary' onClick={handleGetCoordinate}>获取地图配置</Button>
                    </div>
                  </FormItem>
                </Col>
              </Row>
            </Form>
            <div>
              <MapSelect
                v-model:visible={state.visible} layerInfo={state.layerInfo} value={{
                  center: state.formData.coordinate,
                  zoom: state.formData.zoom
                }} onOk={(value: { center: string; zoom: string; }) => {
                  state.formData.coordinate = value.center
                  state.formData.zoom = value.zoom
                  state.visible = false
                }} selectType='region' ref={mapRef}
              />

            </div>
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button onClick={() => {
              router.back()
            }}
            >返回
            </Button>
            <Button type='primary' onClick={handleSubmit}>保存</Button>
          </div>
        )
      }
    }
    return (): JSX.Element => (
      <GLayout title={`${route.query.id ? '编辑' : '新增'}区域`} showFooter showSearch={false} v-slots={layoutSlots} />
    )
  }
})
