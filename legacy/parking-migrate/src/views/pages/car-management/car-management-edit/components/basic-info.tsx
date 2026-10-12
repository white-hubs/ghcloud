import { defineComponent, reactive, ref, watch, onMounted } from 'vue'
import { Form, FormItem, Row, Col, Input, Select, Image, ImagePreviewGroup } from '@ghcloud/cube-ui'
import { cubeParkingLotService } from '@/api/service'
import { useRoute } from 'vue-router'
import styles from '../car-management-edit.module.less'
import type { FileVOState } from '@ghcloud/cube-protocol'
import { FileUpload } from '@ghcloud/cube-app-design'
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import type { VehicleTypeVO } from "@ghcloud/cube-parking-lot-service/src/type";
import { cloneDeep } from 'lodash';

export const BasicInfo = defineComponent({
  props: {
    initFormState: {
      type: Object,
      default: () => ({})
    }
  },
  setup: (props, { expose }) => {
    const route = useRoute()
    const formRef = ref()
    const vehicleTypes = ref<VehicleTypeVO[]>([])
    
    const state = reactive<{
      type: string | undefined;
      formState: {
        vehicleNo: string;
        vehicleNoColor: string | undefined;
        customerName: string;
        vehicleTypeCode: string | undefined;
        vehicleTypeName: string;
        customerMobile: string;
        fileList: FileVOState[];
      }
    }>({
      type: undefined,
      formState: {
        vehicleNo: '',
        vehicleNoColor: undefined,
        customerName: '',
        vehicleTypeCode: undefined,
        vehicleTypeName: '',
        customerMobile: '',
        fileList: []
      }
    })
    const fetchVehicleTypes = async () => {
      try {
        const res = await cubeParkingLotService.getVehicleTypeList({})
        vehicleTypes.value = res ?? []
      } catch {
      }
    }

    onMounted(() => {
      fetchVehicleTypes()
    })

    watch(() => props.initFormState, (val) => {
      if (props.initFormState) {
        Object.assign(state.formState, cloneDeep(props.initFormState))
      } else {
        state.formState = {
          vehicleNo: '',
          vehicleNoColor: undefined,
          customerName: '',
          vehicleTypeCode: undefined,
          vehicleTypeName: '',
          customerMobile: '',
          fileList: []
        }
      }
    }, { immediate: true, deep: true })

    const plateColorOptions = [
      { label: '蓝牌', value: 'BLUE' },
      { label: '黄牌', value: 'YELLOW' },
      { label: '绿牌', value: 'GREEN' },
      { label: '黑牌', value: 'BLACK' },
      { label: '白牌', value: 'WHITE' },
      { label: '未知', value: 'UNKNOWN' },
    ]

    const rules = {
      vehicleNo: [
        { required: true, message: '请输入车牌号' },
      ],
      customerName: [{ required: true, message: '请输入车主姓名' }],
      vehicleNoColor: [{ required: true, message: '请选择车牌颜色' }],
      customerMobile: [
        { required: true, message: '请输入联系方式' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
      ],
      vehicleTypeCode: [{ required: true, message: '请选择车辆类型' }],
    }

    const handleSubmit = async () => {
      await formRef.value?.validate()
      const fileIdList = state.formState.fileList.map((file: FileVOState) => {
          return file?.id
      })
      const vehicleTypeName = vehicleTypes.value.find(item => item.id === state.formState.vehicleTypeCode)?.name
      return {
          ...state.formState,
          fileIdList,
          vehicleTypeName
      }
    }

    expose({ handleSubmit })

    const isInfo = route.query.type === 'info'

    const EditForm = () => (
      <Form
        ref={formRef}
        model={state.formState}
        rules={rules}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        <Row gutter={24}>
          <Col span={12}>
            <FormItem label="车牌号" name="vehicleNo">
              <Input v-model:value={state.formState.vehicleNo} placeholder="请输入车牌号" />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="车牌颜色" name="vehicleNoColor">
              <Select
                v-model:value={state.formState.vehicleNoColor}
                placeholder="请选择车牌颜色"
                options={plateColorOptions}
                allowClear
              />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="车主姓名" name="customerName">
              <Input v-model:value={state.formState.customerName} placeholder="请输入车主姓名" />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="车辆类型" name="vehicleTypeCode">
              <Select
                v-model:value={state.formState.vehicleTypeCode} 
                placeholder="请选择车辆类型"
                options={vehicleTypes.value}
                fieldNames={{
                  label: 'name',
                  value: 'id'
                }}
              />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="联系方式" name="customerMobile">
              <Input v-model:value={state.formState.customerMobile} placeholder="请输入联系方式" />
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label='附件:' label-col={{ span: 3 }} >
              <FileUpload sceneCode={GLOBAL_SCENE_CODE.parkingVehicle} multiple v-model:value={state.formState.fileList} maxCount={5} type='picture-card' customText='支持上传图片（.png/.jpeg/.jpg）,最大为300MB' accept="image/*" />
            </FormItem>
          </Col>
        </Row>
      </Form>
    )

    const InfoForm = () => (
      <div class={styles.infoContainer}>
        <Row gutter={[0, 24]}>
           <Col span={12}><span class={styles.label}>车牌号：</span><span>{state.formState.vehicleNo || '--'}</span></Col>
           <Col span={12}><span class={styles.label}>车牌颜色：</span><span>{state.formState.vehicleNoColor || '--'}</span></Col>
           <Col span={12}><span class={styles.label}>车主姓名：</span><span>{state.formState.customerName || '--'}</span></Col>
           <Col span={12}><span class={styles.label}>车辆类型：</span><span>{state.formState.vehicleTypeName || '--'}</span></Col>
           <Col span={12}><span class={styles.label}>联系方式：</span><span>{state.formState.customerMobile || '--'}</span></Col>
           <Col span={24}><span class={styles.label}>附件：</span>
              {state.formState.fileList.length ? 
                <FileUpload readonly sceneCode={GLOBAL_SCENE_CODE.parkingVehicle} multiple v-model:value={state.formState.fileList} maxCount={5} type='picture-card' customText='支持上传图片（.png/.jpeg/.jpg）,最大为300MB' typeList={['.pdf', '.png', '.jpg', '.jpeg']} />
                // state.formState.fileList.map(file => (
                //   <div class={styles['image-container']}>
                //     <ImagePreviewGroup>
                //       <Image
                //         key={file.id}
                //         src={file.path}
                //         style={{ width: '100px', height: '100px' }}
                //         width={100}
                //         height={100}
                //       />
                //     </ImagePreviewGroup>
                //   </div>
                // ))
                : '--'}
           </Col>
        </Row>
      </div>
    )

    return () => (
      <div class={styles.basicInfo}>
        <div class={styles.title}>基本信息</div>
        {isInfo ? <InfoForm /> : <EditForm />}
      </div>
    )
  }
})
