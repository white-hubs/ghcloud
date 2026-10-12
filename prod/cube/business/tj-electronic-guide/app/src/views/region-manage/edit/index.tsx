import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Form, FormItem, Input, Row, Col, Button, message, InputNumber } from '@ghcloud/cube-ui'
import { Map } from '@/components/map'
import { createArea, getAreaInfo, updateArea } from '@/apis/region-manage'
import { useRouter, useRoute } from 'vue-router'
import { logger } from '@/logger'
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
    const state = reactive({
      // 表单数据
      formData: {
        name: '',
        zoom: '',
        coordinate: '',
        level: '',
      }
    })
    const handleGetCoordinate = (): void => {
      state.formData.coordinate = mapRef.value?.getPoint() ?? ''
    }
    const handleGetZoom = (): void => {
      state.formData.zoom = (mapRef.value?.getZoom() ?? '') + ''
    }
    const getAreaInfoData = async (): Promise<void> => {
      if (route.query.id) {
        const data = await getAreaInfo(route.query.id as string)
        state.formData = data
      }
    }
    onMounted(() => {
      getAreaInfoData()
    })
    const handleSubmit = async (): Promise<void> => {
      await formRef.value?.validate()
      !route.query.id ? await createArea(state.formData) : await updateArea(state.formData)
      message.success('保存成功')
      router.back()
    }
    const layoutSlots = {
      'content-table': () => {
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
                      <Input v-model:value={state.formData.zoom} placeholder='请输入区域地图缩放' readonly />
                      <Button type='primary' onClick={handleGetZoom}>获取区域地图缩放</Button>
                    </div>
                  </FormItem>
                  <FormItem label='排序' name='level' style={{ width: '60%' }}>
                    <InputNumber v-model:value={state.formData.level} max={999} placeholder='请输入排序0-999' />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label='区域坐标' name='coordinate'>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <Input v-model:value={state.formData.coordinate} maxlength={9999} showCount={false} placeholder='请输入点位名称' readonly />
                      <Button type='primary' onClick={handleGetCoordinate}>获取坐标</Button>
                    </div>
                    <div>
                      <Map center={state.formData.coordinate} loadLayer zoom={state.formData.zoom} v-model:value={state.formData.coordinate} ref={mapRef} />
                    </div>
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </div>
        )
      },
      'footer-page': () => {
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
    return () => (
      <GLayout title={`${route.query.id ? '编辑' : '新增'}区域`} showFooter showSearch={false} v-slots={layoutSlots} />
    )
  }
})
