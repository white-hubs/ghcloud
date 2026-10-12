import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Form, FormItem, Input, Row, Col, Select, Textarea, Button, message, InputNumber, TreeSelect } from '@ghcloud/cube-ui'
import { MapSelect } from '@/components/map-select/map-select'
import { getAreaListTree } from '@/apis/region-manage'
import { createPoint, getPointInfo, updatePoint } from '@/apis/point-manage'
import { getPointTypeList } from '@/apis/point-type'
import { useRouter, useRoute } from 'vue-router'
import { getUsingLayerDetails } from '@/apis/layer-manage'
import { GUpload } from '@/components/common/upload'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
export const EditPoint = defineComponent({
  setup: () => {
    const mapRef = ref<{ getPoint: () => string; getZoom: () => string; }>()
    const router = useRouter()
    const route = useRoute()
    const formRef = ref<{ validate: () => Promise<void>; }>()
    const formRules = {
      name: [{ required: true, message: '请输入点位名称' }],
      areaId: [{ required: true, message: '请选择区域' }],
      typeId: [{ required: true, message: '请选择点位类型' }],
      coordinate: [{ required: true, message: '请获取点位坐标' }],
      address: [{ required: true, message: '请输入点位地址' }],
    }
    const state = reactive({
      areaOptions: [],
      mapVisible: false,
      pointTypeOptions: [],
      areaCenter: '',
      zoom: '',
      layerInfo: {
        southwest: '',
        northeast: '',
        center: '',
        layerFile: ''
      },
      formData: {
        areaId: '',
        typeId: '',
        address: '',
        coordinate: '',
        interactivityType: '',
        name: '',
        filePath: '',
        level: 0,
        remarks: ''
      }
    })
    const options = [
      {
        label: '区域',
        value: 'AREA'
      },
      {
        label: '点位',
        value: 'POINT'
      },
    ]
    const handleSelectChange = async (value: string, option: { coordinate: string;zoom: string; }): Promise<void> => {
      state.areaCenter = option.coordinate
      state.zoom = option.zoom
      const { data } = await getUsingLayerDetails({ areaId: value })
      if (!data) {
        state.layerInfo = {
          southwest: '',
          northeast: '',
          center: '',
          layerFile: ''
        }
        return
      }
      state.layerInfo = {
        southwest: data.southwest,
        northeast: data.northeast,
        center: data.center,
        layerFile: data.layerFile
      }
    }
    onMounted(async () => {
      await getAreaOption()
      await getPointTypeOption()
      route.query.id && await getPointDetail()
    })
    const getAreaOption = async (): Promise<void> => {
      const { data } = await getAreaListTree()
      state.areaOptions = data
    }
    const getPointTypeOption = async (): Promise<void> => {
      const { data } = await getPointTypeList()
      state.pointTypeOptions = data
    }
    const handleGetCoordinate = (): void => {
      // state.formData.coordinate = mapRef.value?.getPoint() ?? ''
      state.mapVisible = true
    }
    const getPointDetail = async (): Promise< void> => {
      const { data } = await getPointInfo(route.query.id as string)
      const { areaId } = data
      state.formData = data
      const areaInfo = await getUsingLayerDetails({ areaId })
      if (!areaInfo.data) return
      state.layerInfo = {
        southwest: areaInfo.data.southwest,
        northeast: areaInfo.data.northeast,
        center: areaInfo.data.center,
        layerFile: areaInfo.data.layerFile
      }
      state.zoom = areaInfo.data.area.zoom
      state.areaCenter = areaInfo.data.area.coordinate
    }
    const handleSubmit = async (): Promise<void> => {
      try {
        await formRef.value?.validate()
        !route.query.id ? await createPoint(state.formData) : await updatePoint(state.formData)
        message.success('保存成功')
        router.back()
      } catch {
        message.error('新增失败')
      }
    }
    const handleOk = (value: { point: string; }): void => {
      state.formData.coordinate = value.point
    }
    const layoutSlots = {
      'content-table': (): JSX.Element => {
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
                  <FormItem label='点位类型' name='interactivityType'>
                    <Select fieldNames={{ value: 'id', label: 'name' }} options={options} v-model:value={state.formData.interactivityType} placeholder='请选择区域' />
                  </FormItem>
                  <FormItem label='排序' name='level' style={{ width: '60%' }}>
                    <InputNumber v-model:value={state.formData.level} max={999} placeholder='请输入排序0-999' />
                  </FormItem>
                  <FormItem label='点位描述' name='remarks'>
                    <Textarea v-model:value={state.formData.remarks} placeholder='请输入点位描述' />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label='点位类型' name='typeId'>
                    <Select fieldNames={{ value: 'id', label: 'name' }} options={state.pointTypeOptions} v-model:value={state.formData.typeId} placeholder='请选择区域' />
                  </FormItem>
                  <FormItem label='所在区域' name='areaId'>
                    <TreeSelect fieldNames={{ value: 'id', label: 'name' }} onSelect={handleSelectChange} allow-clear tree-data={state.areaOptions} v-model:value={state.formData.areaId} placeholder='请选择区域' />
                  </FormItem>
                  <FormItem label='点位坐标' name='coordinate'>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <Input v-model:value={state.formData.coordinate} maxlength={9999} showCount={false} />
                      <Button type='primary' onClick={handleGetCoordinate}>获取坐标</Button>
                    </div>
                  </FormItem>
                  <FormItem label='点位图片' name='filePath'>
                    <GUpload sceneCode={GLOBAL_SCENE_CODE.electronicGuide} v-model:value={state.formData.filePath} max={1} />
                  </FormItem>
                </Col>
              </Row>
              <div>
                <MapSelect
                  layerInfo={state.layerInfo}
                  v-model:visible={state.mapVisible} value={{
                    point: state.formData.coordinate,
                  }} onOk={handleOk} selectType='point' ref={mapRef}
                />
              </div>
            </Form>
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
      <GLayout title={`${route.query.id ? '编辑' : '新增'}点位`} showSearch={false} v-slots={layoutSlots} />
    )
  }
})
