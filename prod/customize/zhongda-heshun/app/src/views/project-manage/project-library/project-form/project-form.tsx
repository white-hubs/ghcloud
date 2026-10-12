import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import type { FormExpose, RuleObject } from '@ghcloud/cube-ui/src/components/form/form'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import { Textarea } from '@ghcloud/cube-ui'
import { cubeZhongdaHeshunService } from '@/api/service'
import dayjs from 'dayjs'
import { FileUpload, UserSelectPage } from '@ghcloud/cube-app-design'
import type { OSSFile } from '@ghcloud/generic-component'
import MapDetailButton from './mapDetailButton'

interface Props {
  projectId: string;
  action: string;
}

export const ProjectForm = defineComponent({
  props: ['projectId', 'action'],
  setup: (props: Props) => {
    const action = props.action
    const id = props.projectId
    const readonly = action === 'details'


    const formData = ref<{
      id: string;
      projectName: string;
      projectTypeId: string;
      projectTypeName: string;
      company: string;
      times: string[];
      beginTime: string;
      endTime: string;
      leaderId: string;
      leaderName: string;
      disinfectionArea?: number;
      disinfectionLocationName: string;
      disinfectionLocation: string;
      disinfectionScope: string;
      description: string;
      projectImage?: OSSFile[];
    }>({
      id: '',
      projectName: '',
      projectTypeId: '',
      projectTypeName: '',
      company: '',
      times: [],
      beginTime: '',
      endTime: '',
      leaderId: '',
      leaderName: '',
      disinfectionArea: 0,
      disinfectionLocationName: '',
      disinfectionLocation: '',
      disinfectionScope: '',
      description: ''
    })

    /** 表单实例 */
    const dynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const options = computed(() => {
      const res: DynamicFormRenderOptionProps[] = [
        { title: '项目名称', key: 'projectName', width: 46, componentName: 'TextInput', required: true, readonly: readonly },
        { title: '项目类型', key: 'projectTypeName', width: 46, componentName: 'TextInput', required: true, readonly: readonly },
        { title: '业主单位', key: 'company', width: 46, componentName: 'TextInput', readonly: readonly },
        { title: '项目周期', key: 'times', width: 46, componentName: 'DateTimeRange', required: true, readonly: readonly },
        { title: '项目所在地', key: 'disinfectionLocationName', width: 46, componentName: 'TextInput', required: true, readonly: readonly },
        { title: '项目范围', key: 'disinfectionScope', width: 46, customComponent: MapDetailButton },
        { title: '项目面积', key: 'disinfectionArea', width: 46, componentName: 'NumberInput', componentProps: { min: 0, placeholder: '请输入项目面积', maxLength: 9 }, readonly: readonly },
        { title: '项目负责人', key: readonly ? 'leaderName' : 'leaderId', width: 46,  customComponent: UserSelectPage,  required: true, componentProps: { title: '选择负责人' }, readonly: readonly },
        { title: '项目说明', key: 'description', width: 46, customComponent: readonly ? <span>{formData.value.description || '--'}</span> : <Textarea />, readonly: readonly },
        { title: '项目文件', key: 'projectImage', width: 46, customComponent: FileUpload, componentProps: { type: 'picture-card' }, readonly: readonly },
      ]
      return res
    })

    const customValidatesRules = computed(() => {
      const res: Record<string, RuleObject> = {
        leaderId: { required: true, trigger: 'change', message: '请选择负责人' } satisfies RuleObject,
        projectTypeId: { required: true, trigger: 'change', message: '请选择项目类型' } satisfies RuleObject,
      }
      return res
    })
    // 监听负责人值变化
    watch(() => formData.value.leaderId, () => {
      if (!readonly) {
        dynamicFormRenderRef.value?.formRef.clearValidate('leaderId')
      }
    })
    // 监听负责人值变化
    watch(() => formData.value.projectTypeId, () => {
      if (!readonly) {
        dynamicFormRenderRef.value?.formRef.clearValidate('projectTypeId')
      }
    })


    const init = ref(false)
    onMounted(async () => {
      
      if (action !== 'add') {
        if (id) { 
          const response = await cubeZhongdaHeshunService.getProjectPageDetail({ id: id as string }) as {
            id: string;
            projectName: string;
            projectTypeId: string;
            projectTypeName: string;
            company: string;
            times: string[];
            beginTime: string;
            endTime: string;
            leaderId: string;
            leaderName: string;
            disinfectionArea?: number;
            disinfectionLocationName: string;
            disinfectionLocation: string;
            disinfectionScope: string;
            description: string;
            projectImage: OSSFile;
          }
          formData.value = {
            ...response,
            times: [dayjs(new Date(response.beginTime)).format('YYYY-MM-DD'), '--', dayjs(response.endTime).format('YYYY-MM-DD')],
            projectImage: response.projectImage ? [response.projectImage] : []
          }
        }
      }
      init.value = true
    })


    return (): JSX.Element => {
      return (init ?
        <DynamicFormRender
          formOptions={options.value}
          customValidatesRules={customValidatesRules.value}
          labelWidth='150px'
          v-model:formData={formData.value}
          ref={dynamicFormRenderRef}
          style={{ margin: '20px' }}
        /> : <div></div>)
    }

  }
})