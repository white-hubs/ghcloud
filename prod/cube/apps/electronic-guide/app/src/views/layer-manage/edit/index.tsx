import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Form, FormItem, Input, Row, Col, Button, message, TreeSelect } from '@ghcloud/cube-ui'
import { useRouter, useRoute } from 'vue-router'
import { GUpload } from '@/components/common/upload'
import { getLayerImageDetail, addLayerImage, updateLayerImage } from '@/apis/layer-manage'
import type { AreaVo } from '@/apis/region-manage'
import { getAreaListTree } from '@/apis/region-manage'
import { MapSelect, type LayerSelectVo } from '@/components/map-select/map-select'
import styles from './index.module.less'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
export interface FormData {
  layerFile: string;
  southwest: string;
  northeast: string;
  layerName: string;
  areaId: '';
  center: string;
  id?: string;
  createTime?: string;
  state?: string;
}
type MapFormKey = 'southwest' | 'northeast' | 'center'
export const EditLayer = defineComponent({
  setup: () => {
    // const centerMapRef = ref<{ getPoint: () => string; getZoom: () => string; }>()
    // const southwestMapRef = ref<{ getPoint: () => string; getZoom: () => string; }>()
    // const northeastMapRef = ref<{ getPoint: () => string; getZoom: () => string; }>()
    const uploadRef = ref<{ clearAll: () => void; }>()
    const router = useRouter()
    const route = useRoute()
    const formRef = ref<{ validate: () => Promise<void>; }>()
    const formRules = {
      layerFile: [{ required: true, message: '请上传文件' }],
      layerName: [{ required: true, message: '请输入图层名称' }],
      southwest: [{ required: true, message: '请填入西南角' }],
      areaId: [{ required: true, message: '请填入西南角' }],
      center: [{ required: true, message: '请填入中心' }],
      northeast: [{ required: true, message: '请填入东北角' }],
    }
    const state = reactive<{ areaOptions: AreaVo[]; formData: FormData;selectPoint: {
      visible: boolean;
      value: string;
      center: string;
    }; }>({
      areaOptions: [],
      formData: {
        layerFile: '',
        southwest: '',
        northeast: '',
        center: '',
        areaId: '',
        layerName: '',
      },
      selectPoint: {
        visible: false,
        value: '',
        center: '',
      }
    })
    const getDetail = async (): Promise<void> => {
      const { data } = await getLayerImageDetail(route.query.id as string)
      state.formData = data
      state.formData.areaId = data.area.id
      // state.formData.southwest = '38.9591,116.981799'
    }
    const getAreaTree = async (): Promise<void> => {
      const { data } = await getAreaListTree()
      state.areaOptions = data
    }
    onMounted(async () => {
      await getAreaTree()
      route.query.id &&
     await getDetail()
    })
    const handleGetPoint = (key: MapFormKey): void => {
      state.selectPoint.visible = true
      state.selectPoint.value = state.formData[key]
      state.selectPoint.center = state.formData.center
    }
    const handlePointOk = (value: LayerSelectVo): void => {
      state.formData = {
        ...state.formData,
        ...value
      }
    }
    const handleSubmit = async (): Promise<void> => {
      await formRef.value?.validate()
      try {
        route.query.id
          ? await
          updateLayerImage(state.formData)
          : await addLayerImage(state.formData)
        message.success('保存成功')
        router.back()
      } catch {

      }
    }
    const layoutSlots = {
      'content-table': (): JSX.Element => {
        return (
          <div style={{ padding: '20px 30px' }}>
            <Form
              ref={formRef}
              rules={formRules}
              labelCol={{
                style: {
                  width: '90px'
                }
              }}
              model={state.formData}
            >
              <Row>
                <Col span={12}>
                  <FormItem label='层级名称' name='layerName'>
                    <Input v-model:value={state.formData.layerName} placeholder='请输入点位名称' />
                  </FormItem>

                  <FormItem label='地图配置' name='center'>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {/* <Input v-model:value={state.formData.center} maxlength={9999} showCount={false} /> */}
                      <div class={styles.desc}>
                        <Input v-model:value={state.formData.center} maxlength={9999} showCount={false} />
                        <Input v-model:value={state.formData.southwest} maxlength={9999} showCount={false} />
                        <Input v-model:value={state.formData.northeast} maxlength={9999} showCount={false} />
                      </div>
                      <Button type='primary' onClick={() => {
                        handleGetPoint('center')
                      }}>获取坐标</Button>
                    </div>
                  </FormItem>

                </Col>
                <Col span={12}>
                  <FormItem label='图层区域' name='areaId'>
                    <TreeSelect fieldNames={{ label: 'name', value: 'id' }} v-model:value={state.formData.areaId} allow-clear tree-data={state.areaOptions} placeholder='请选择父级区域' />
                  </FormItem>
                  <FormItem label='图层图片' name='layerFile'>
                    <GUpload sceneCode={GLOBAL_SCENE_CODE.electronicGuide} v-model:value={state.formData.layerFile} ref={uploadRef} max={1} />
                  </FormItem>
                  {/* <FormItem label='西南角' name='southwest'>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Input v-model:value={state.formData.southwest} maxlength={9999} showCount={false} />
                      <Button type='primary' onClick={() => { handleGetPoint('southwest') }}>获取坐标</Button>
                    </div>
                  </FormItem>
                  <FormItem label='东北角' name='northeast'>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Input v-model:value={state.formData.northeast} maxlength={9999} showCount={false} />
                      <Button type='primary' onClick={() => { handleGetPoint('northeast') }}>获取坐标</Button>
                    </div>
                  </FormItem> */}
                </Col>
              </Row>

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
      <GLayout title={`${route.query.id ? '编辑' : '新增'}图层`} showSearch={false} v-slots={layoutSlots}>
        <MapSelect
          selectType='layer' onOk={handlePointOk} v-model:visible={state.selectPoint.visible} value={{
            center: state.formData.center,
            northeast: state.formData.northeast,
            southwest: state.formData.southwest,
          }} center={state.selectPoint.center}
        />
      </GLayout>
    )
  }
})
