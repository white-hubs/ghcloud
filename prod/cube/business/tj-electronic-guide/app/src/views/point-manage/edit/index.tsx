import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Form, FormItem, Input, Row, Col, Select, Textarea, Button, message, InputNumber } from '@ghcloud/cube-ui'
import { Map } from '@/components/map'
import { getAreaList } from '@/apis/region-manage'
import { createPoint, getPointInfo, updatePoint } from '@/apis/point-manage'
import { useRouter, useRoute } from 'vue-router'
export const EditPoint = defineComponent({
  setup: () => {
    const mapRef = ref<{ getPoint: () => string; getZoom: () => string; }>()
    const router = useRouter()
    const route = useRoute()
    const formRef = ref<{ validate: () => Promise<void>; }>()
    const formRules = {
      name: [{ required: true, message: '请输入点位名称' }],
      areaId: [{ required: true, message: '请选择区域' }],
      coordinate: [{ required: true, message: '请获取点位坐标' }],
      address: [{ required: true, message: '请输入点位地址' }],
    }
    const state = reactive({
      areaOptions: [],
      areaCenter: '',
      zoom: '',
      formData: {
        areaId: '',
        address: '',
        coordinate: '',
        name: '',
        level: 0,
        remarks: ''
      }
    })
    const handleSelectChange = (value: string, option: { coordinate: string;zoom: string; }): void => {
      state.areaCenter = option.coordinate
      state.zoom = option.zoom
    }
    onMounted(async () => {
      await getAreaOption()
      route.query.id && await getPointDetail()
    })
    const getAreaOption = async (): Promise<void> => {
      const  data  = await getAreaList({ pageNumber: 1, pageSize: 10000 })
      state.areaOptions = data.records
    }
    const handleGetCoordinate = (): void => {
      state.formData.coordinate = mapRef.value?.getPoint() ?? ''
    }
    const getPointDetail = async (): Promise< void> => {
      const  data  = await getPointInfo(route.query.id as string)
      const { areaId } = data
      const area = (state.areaOptions as unknown as { id: string;coordinate: string;zoom: string; }[]).find(item => item.id === areaId)
      if (!area) return
      state.areaCenter = area.coordinate
      state.zoom = area.zoom
      state.formData = data
    }
    const handleSubmit = async (): Promise<void> => {
      try {
        await formRef.value?.validate()
        !route.query.id ? await createPoint(state.formData) : await updatePoint(state.formData)
        message.success('保存成功')
        router.back()
      } catch (error) {
        message.error('新增失败')
      }
    }
    const layoutSlots = {
      'content-table': () => {
        return (
          <div style={{ padding: '20px 30px' }}>
            <Form
              ref={formRef}
              rules={formRules}
              model={state.formData}
            >
              <Row>
                <Col span={12}>
                  <FormItem label='点位名称' name='name'>
                    <Input v-model:value={state.formData.name} placeholder='请输入点位名称' />
                  </FormItem>
                  <FormItem label='点位地址' name='address'>
                    <Input v-model:value={state.formData.address} placeholder='请输入点位地址' />
                  </FormItem>
                  <FormItem label='排序' name='level' style={{ width: '60%' }}>
                    <InputNumber v-model:value={state.formData.level} max={999} placeholder='请输入排序0-999' />
                  </FormItem>
                  <FormItem label='点位描述' name='remarks'>
                    <Textarea v-model:value={state.formData.remarks} placeholder='请输入点位描述' />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label='所在区域' name='areaId'>
                    <Select fieldNames={{ value: 'id', label: 'name' }} onChange={handleSelectChange} options={state.areaOptions} v-model:value={state.formData.areaId} placeholder='请选择区域' />
                  </FormItem>
                  <FormItem label='点位坐标' name='coordinate'>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <Input v-model:value={state.formData.coordinate} maxlength={9999} showCount={false} />
                      <Button type='primary' onClick={handleGetCoordinate}>获取坐标</Button>
                    </div>
                    <div>
                      <Map center={state.areaCenter} zoom={state.zoom} loadLayer v-model:value={state.formData.coordinate} ref={mapRef} />
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
      <GLayout title={`${route.query.id ? '编辑' : '新增'}点位`} showSearch={false} v-slots={layoutSlots} />
    )
  }
})
