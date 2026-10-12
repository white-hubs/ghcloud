import { defineComponent, onMounted, reactive, ref, type Ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Form, FormItem, Input, Row, Col, Button } from '@ghcloud/cube-ui'
import { Map } from '@/components/map'
import { useRouter, useRoute } from 'vue-router'
import { GUpload } from '@/components/common/upload'
import { getLayerImageDetail, addLayerImage, updateLayerImage } from '@/apis/layer-manage'
import { message } from 'ant-design-vue/es'
export interface FormData {
  layerFile: string;
  southwest: string;
  northeast: string;
  layerName: string;
  center: string;
  id?: string;
  createTime?: string;
  state?: string;
}
type MapFormKey = 'southwest' | 'northeast' | 'center'
export const EditLayer = defineComponent({
  setup: () => {
    const centerMapRef = ref<{ getPoint: () => string; getZoom: () => string; }>()
    const southwestMapRef = ref<{ getPoint: () => string; getZoom: () => string; }>()
    const northeastMapRef = ref<{ getPoint: () => string; getZoom: () => string; }>()
    const uploadRef = ref<{ clearAll: () => void; }>()
    const router = useRouter()
    const route = useRoute()
    const formRef = ref<{ validate: () => Promise<void>; }>()
    const formRules = {
      layerFile: [{ required: true, message: '请上传文件' }],
      layerName: [{ required: true, message: '请输入图层名称' }],
      southwest: [{ required: true, message: '请填入西南角' }],
      center: [{ required: true, message: '请填入中心' }],
      northeast: [{ required: true, message: '请填入东北角' }],
    }
    const state = reactive<{ formData: FormData; }>({
      formData: {
        layerFile: '',
        southwest: '',
        northeast: '',
        center: '',
        layerName: '',
      }
    })
    const getDetail = async (): Promise<void> => {
      const  data  = await getLayerImageDetail(route.query.id as string)
      state.formData = data
      // state.formData.southwest = '38.9591,116.981799'
    }
    onMounted(() => {
      route.query.id &&
      getDetail()
    })
    const handleGetPoint = (key: MapFormKey): void => {
      const mapRef: Record<MapFormKey, Ref<{
        getPoint: () => string;
        getZoom: () => string;
      } | undefined>> = {
        southwest: southwestMapRef,
        northeast: northeastMapRef,
        center: centerMapRef,
      }
      state.formData[key] = mapRef[key].value?.getPoint() ?? ''
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
      } catch (error) {

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
                  <FormItem label='层级名称' name='layerName'>
                    <Input v-model:value={state.formData.layerName} placeholder='请输入点位名称' />
                  </FormItem>
                  <FormItem label='层级图片' name='layerFile'>
                    <GUpload v-model:value={state.formData.layerFile} ref={uploadRef} max={1} />
                  </FormItem>
                  <FormItem label='中心' name='center'>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <Input v-model:value={state.formData.center} readonly maxlength={9999} showCount={false} />
                      <Button type='primary' onClick={() => { handleGetPoint('center') }}>获取坐标</Button>
                    </div>
                    <div>
                      <Map center={state.formData.center} v-model:value={state.formData.center} ref={centerMapRef} id='center-map' />
                    </div>
                  </FormItem>
                </Col>
                <Col span={12}>

                  <FormItem label='西南角' name='southwest'>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <Input v-model:value={state.formData.southwest} readonly maxlength={9999} showCount={false} />
                      <Button type='primary' onClick={() => { handleGetPoint('southwest') }}>获取坐标</Button>
                    </div>
                    <div>
                      <Map center={state.formData.center} v-model:value={state.formData.southwest} ref={southwestMapRef} id='southwest-map' />
                    </div>
                  </FormItem>
                  <FormItem label='东北角' name='northeast'>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <Input v-model:value={state.formData.northeast} readonly maxlength={9999} showCount={false} />
                      <Button type='primary' onClick={() => { handleGetPoint('northeast') }}>获取坐标</Button>
                    </div>
                    <div>
                      <Map center={state.formData.center} v-model:value={state.formData.northeast} ref={northeastMapRef} id='northeast-map' />
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
      <GLayout title={`${route.query.id ? '编辑' : '新增'}图层`} showSearch={false} v-slots={layoutSlots} />
    )
  }
})
