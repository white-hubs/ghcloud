import { computed, defineComponent, onMounted, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose, RuleObject } from '@ghcloud/cube-ui/src/components/form/form'
import ThemeSelectInput from '@/components/business/theme-select-input/theme-select-input'
import { FileUpload } from '@ghcloud/generic-component'
import type { CoursewareRow } from '@/types/question'
import { coursewareDetail, coursewareInsert, coursewareUpdate } from '@/api/courseware'
import { audioType, calcMediaTime, videoType } from '@/utils/index'
import { logger } from '@/logger'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
export const CoursewareForm = defineComponent({
  setup: () => {
    const { action, id } = useRoute().query

    /** 标题 */
    const title = computed(() => {
      let res = '课件库'
      if (action === 'add') {
        res += ' / 新增'
      } else if (action === 'edit') {
        res += ' / 编辑'
      } else {
        res += ' / 详情'
      }
      return res
    })

    /** 表单实例 */
    const dynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const options: DynamicFormRenderOptionProps[] = [
      { title: '课件名称', key: 'name', width: 92, componentName: 'TextInput', required: true },
      { title: '课件主题', key: 'themeId', width: 46, required: true, customComponent: ThemeSelectInput },
      { title: '课件描述', key: 'remark', width: 46, componentName: 'TextareaInput' },
      { title: '附件', key: 'file', width: 92, customComponent: FileUpload, componentProps: { multiple: false, sceneCode: GLOBAL_SCENE_CODE.safetyEducationCourseWare }, required: true },
    ]
    if (action === 'detail') {
      options.forEach(e => {
        e.readonly = true
      })
    }

    const formData = ref<CoursewareRow & { file?: { id: string;path: string;type: string; }[];id?: string; }>({
      themeId: undefined,
      name: '',
      remark: '',
      fileId: '',
      duration: 0,
      file: []
    })
    const validateFile = async (): Promise<void> => {
      const files = formData.value.file ?? []
      if (files.length === 0) {
        return Promise.reject(new Error('请上传附件'))
      }
      return Promise.resolve()
    }
    const customValidatesRules = {
      file: {
        required: true,
        trigger: 'blur',
        validator: validateFile
      } satisfies RuleObject
    }

    // 保存
    const saveLoading = ref(false)
    const save = async (): Promise<void> => {
      await dynamicFormRenderRef.value?.formRef.validate()
      try {
        saveLoading.value = true
        formData.value.fileId = formData.value.file?.[0].id ?? ''
        if (formData.value.file?.[0].type) {
          if (videoType.includes(formData.value.file?.[0].type) && formData.value.file?.[0].path) {
            formData.value.duration = await calcMediaTime(formData.value.file[0].path, 'video')
          }
          if (audioType.includes(formData.value.file?.[0].type) && formData.value.file?.[0].path) {
            formData.value.duration = await calcMediaTime(formData.value.file[0].path, 'audio')
          }
        }
        if (action === 'add') {
          const params = {
            ...formData.value
          }
          await coursewareInsert(params)
        } else {
          const params = {
            ...formData.value,
            id: id as string
          }
          await coursewareUpdate(params)
        }

        message.success('操作成功')
        history.back()
      } catch (error) {
        logger.error(error)
      } finally {
        saveLoading.value = false
      }
    }

    const init = ref(false)
    onMounted(async () => {
      if (action !== 'add') {
        if (id) {
          const res = await coursewareDetail({ id: id as string })
          if (res.data) {
            res.data.file = [res.data.file]
            formData.value = res.data as CoursewareRow
          }
        }
      }
      init.value = true
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element | undefined=> {
        if (!init.value) {
          return
        }
        return (
          <DynamicFormRender
            formOptions={options}
            customValidatesRules={customValidatesRules}
            labelWidth='150px'
            v-model:formData={formData.value}
            ref={dynamicFormRenderRef}
            style={{ margin: '20px' }}
          />
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button onClick={() => {
              history.back()
            }}>返回</Button>
            {action !== 'detail' && <Button type='primary' style={{ marginLeft: '10px' }} loading={saveLoading.value} onClick={save}>保存</Button>}
          </>
        )
      }
    }
    return (): JSX.Element => <Layout title={title.value} v-slots={layoutSlots} />
  }
})
