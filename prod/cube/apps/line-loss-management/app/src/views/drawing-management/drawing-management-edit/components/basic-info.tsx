import { defineComponent, reactive, ref, watch, onMounted } from 'vue'
import { Form, FormItem, Row, Col, Input, Select, Textarea } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import styles from '../drawing-management-edit.module.less'
import type { FileVOState } from '@ghcloud/cube-protocol'
import { FileUpload } from '@ghcloud/cube-app-design'
import { cloneDeep } from 'lodash'
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";

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
    
    const state = reactive<{
      formState: {
        name: string;
        type: string | undefined;
        description: string;
        fileList: FileVOState[];
      }
    }>({
      formState: {
        name: '',
        type: undefined,
        description: '',
        fileList: []
      }
    })

    watch(() => props.initFormState, (val) => {
      if (props.initFormState && Object.keys(props.initFormState).length > 0) {
        Object.assign(state.formState, cloneDeep(props.initFormState))
      } else {
        state.formState = {
          name: '',
          type: undefined,
          description: '',
          fileList: []
        }
      }
    }, { immediate: true, deep: true })

    const rules = {
      name: [{ required: true, message: '请输入图纸名称' }],
      type: [{ required: true, message: '请选择图纸类型' }],
      fileList: [{ required: true, message: '请上传附件' }]
    }

    const handleSubmit = async () => {
      await formRef.value?.validate()
      return { ...state.formState }
    }

    expose({ handleSubmit })

    const isInfo = route.query.type === 'info'

    const typeOptions = [
      { label: '文件类型1', value: '1' },
      { label: '文件类型2', value: '2' },
    ]

    const EditForm = () => (
      <Form
        ref={formRef}
        model={state.formState}
        rules={rules}
        wrapperCol={{ span: 20 }}
        labelCol={{ style: { width: '100px' } }}
      >
        <Row gutter={24}>
          <Col span={12}>
            <FormItem label="图纸名称" name="name">
              <Input v-model:value={state.formState.name} placeholder="请输入图纸名称" />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="图纸类型" name="type">
              <Select
                v-model:value={state.formState.type} 
                placeholder="请选择图纸类型"
                options={typeOptions}
                allowClear
                getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
              />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="备注" name="description">
              <Textarea 
                v-model:value={state.formState.description} 
                placeholder="请输入备注" 
                showCount 
                maxlength={200}
                rows={4}
              />
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label='附件' name="fileList">
              <FileUpload
                sceneCode={GLOBAL_SCENE_CODE.parkingVehicle}
                multiple
                v-model:value={state.formState.fileList}
                maxCount={1} 
                type='picture-card'
                size={20}
                customText='支持上传文件最大为20MB，只能上传一个文件'
              />
            </FormItem>
          </Col>
        </Row>
      </Form>
    )

    const InfoForm = () => (
      <div class={styles.infoContainer}>
        <Row gutter={[0, 24]}>
           <Col span={12}><span class={styles.label}>图纸名称：</span><span>{state.formState.name || '--'}</span></Col>
           <Col span={12}><span class={styles.label}>图纸类型：</span><span>{typeOptions.find(t => t.value === state.formState.type)?.label || state.formState.type || '--'}</span></Col>
           <Col span={24}><span class={styles.label}>文件描述：</span><span>{state.formState.description || '--'}</span></Col>
           <Col span={24}><span class={styles.label}>附件：</span>
              {state.formState.fileList.length ? 
                <FileUpload 
                  readonly 
                  sceneCode="drawing" 
                  v-model:value={state.formState.fileList} 
                />
                : '--'}
           </Col>
        </Row>
      </div>
    )

    return () => (
      <div class={styles.basicInfo}>
        <div class={styles.title}>基础信息</div>
        {isInfo ? <InfoForm /> : <EditForm />}
      </div>
    )
  }
})
