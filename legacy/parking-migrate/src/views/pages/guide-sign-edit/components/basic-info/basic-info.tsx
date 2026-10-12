
import { defineComponent, reactive, ref, watch, onMounted, computed } from 'vue'
import { Form, FormItem, Input, Select, Row, Col, type FormInstance, Textarea, Button, Upload } from '@ghcloud/cube-ui'
import styles from './basic-info.module.less'
import { cubeParkingLotService } from "@/api/service";
import { useMapModal } from '@ghcloud/generic-component'
import type { FileVOState } from "@ghcloud/cube-protocol";
import { FileUpload } from "@ghcloud/cube-app-design";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import { useRoute } from 'vue-router'

export const BasicInfo = defineComponent({
  props: {
    initFormState: {
      type: Object,
      default: () => ({})
    }
  },
  setup: (props, { expose }) => {
    const { showMapModal } = useMapModal()
    const formRef = ref<FormInstance>()
    const parkingLots = ref<{ label: string; value: number }[]>([])

    const state = reactive({
      formState: {
        name: '',
        code: '',
        installationLocation: '',
        parkingLotId: undefined as number | undefined,
        remark: '',
        sceneImageIds: '',
        sceneImageFiles: [] as FileVOState[]
      }
    })

    const rules = {
      name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
      parkingLotId: [{ required: true, message: '请选择关联车场', trigger: 'change' }]
    }

    onMounted(async () => {
      try {
        const res = await cubeParkingLotService.getParkingLotList({})
        parkingLots.value = res.map(item => ({
          label: item.name || '',
          value: item.id!
        }))
      } catch (e) {
      }
    })

    watch(() => props.initFormState, (newVal) => {
      if (newVal) {
        Object.assign(state.formState, newVal)
      }
    }, { deep: true, immediate: true })

    const displayLocation = computed(() => {
      try {
        if (!state.formState.installationLocation) return ''
        const parsed = JSON.parse(state.formState.installationLocation)
        return parsed?.address || ''
      } catch (e) {
        return state.formState.installationLocation
      }
    })

    const openMapModal = () => {
      let center = { lng: 104.05906925176734, lat: 30.589318900275615 }
      let address = ''
      try {
        if (state.formState.installationLocation) {
           const parsed = JSON.parse(state.formState.installationLocation)
           if (parsed && typeof parsed === 'object') {
             if (parsed.lng && parsed.lat) {
               center = { lng: Number(parsed.lng), lat: Number(parsed.lat) }
             }
             address = parsed.address || ''
           }
        }
      } catch {
      }
      
      showMapModal({
        title: '选择安装位置',
        address,
        center,
        modalConfirm: (confirmData: any) => {
          const newVal = JSON.stringify({
            address: confirmData.address,
            lng: confirmData.lng,
            lat: confirmData.lat
          })
          state.formState.installationLocation = newVal
        }
      })
    }

    const route = useRoute()

    const handleSubmit = async () => {
       await formRef.value?.validate()
       state.formState.sceneImageIds = state.formState.sceneImageFiles.map(item => item.id)?.join(',')
       return state.formState
    }

    expose({ handleSubmit })

    const EditForm = () => (
      <div class={styles.container}>
        <Form ref={formRef} model={state.formState} rules={rules} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Row gutter={24}>
            <Col span={12}>
              <FormItem label="引导牌名称" name="name">
                <Input v-model:value={state.formState.name} placeholder="请输入引导牌名称" />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="编号" name="code">
                <Input v-model:value={state.formState.code} placeholder="输入编码" />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="安装位置" name="installationLocation">
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Input value={displayLocation.value} placeholder="请选择安装位置" readonly onClick={openMapModal} showCount={false} maxlength={200} />
                  <Button type='primary'  onClick={openMapModal}>选择位置</Button>
                </div>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="关联车场" name="parkingLotId">
                <Select
                  v-model:value={state.formState.parkingLotId}
                  placeholder="选择所属车场"
                  options={parkingLots.value}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="现场图片" name="sceneImageFiles">
                <FileUpload sceneCode={GLOBAL_SCENE_CODE.parkingInfo} multiple showText={false} v-model:value={state.formState.sceneImageFiles} maxCount={5} type='picture-card' accept="image/*"/>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="备注" name="remark">
                 <Textarea
                    v-model:value={state.formState.remark}
                    placeholder="请输入备注"
                    showCount
                    maxlength={200}
                    rows={4}
                    class={styles.textarea} 
                  />
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    )

    const FieldComponent = (props: { label: string; fieldName?: string; span?: number; customRender?: ((value: any) => any) }): any => (
      <Col span={props.span || 12}>
        <div class={styles['item-content']}>
          <label>{props.label}：</label>
          <span style={{flex: 1}}>{props.customRender ? props.customRender(state.formState) : (props.fieldName ? state.formState[props.fieldName as keyof typeof state.formState] : '')}</span>
        </div>
      </Col>
    )

    const InfoForm = () => (
      <div class={styles.container}>
        <Row gutter={[0, 32]}>
          <FieldComponent label="引导牌名称" fieldName="name" />
          <FieldComponent label="编号" fieldName="code" />
          <FieldComponent label="安装位置" customRender={() => displayLocation.value || '--'} />
          <FieldComponent label="关联车场" customRender={() => {
             const found = parkingLots.value.find(p => p.value === state.formState.parkingLotId)
             return found ? found.label : '--'
          }} />
          <FieldComponent label="现场图片" customRender={() => (
              <FileUpload 
                sceneCode={GLOBAL_SCENE_CODE.parkingInfo} 
                multiple 
                showText={false} 
                value={state.formState.sceneImageFiles} 
                maxCount={5} 
                type='picture-card' 
                accept="image/*"
                readonly
              />
           )} />
          <FieldComponent label="备注" fieldName="remark" />
        </Row>
      </div>
    )

    return () => (
      <>
        {route.query.type !== 'info' && <EditForm />}
        {route.query.type === 'info' && <InfoForm />}
      </>
    )
  }
})
