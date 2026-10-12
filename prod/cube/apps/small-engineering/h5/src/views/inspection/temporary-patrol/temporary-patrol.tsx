import { Button, Field, Form, Icon, Loading, Radio, RadioGroup, type FormInstance } from 'vant'
import { defineComponent, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showImagePreview } from '@ghcloud/cube-utils'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { ProjectSelect } from '@/components/project-select'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { cubeSmallEngineeringService } from '@/api/server'
import styles from './temporary-patrol.module.less'

interface Project {
  id: string;
  projectName: string;
  projectTypeName?: string;
  constructionSite?: string;
  duration: string;
  depName: string;
}

interface FormState {
  showProjectSelect: boolean;
  currentProject: Project;
  result: string;
  remarks: string;
  fileVOS: {
    businessKey: string;
    id: string;
    name: string;
    path: string;
    refCount: number;
    size: number;
    suffix: string;
    type: string;
  }[];
}

export const TemporaryPatrol = defineComponent({
  setup: () => {
    const router = useRouter()
    const formRef = ref<FormInstance>()
    const loading = ref(false)
    const formState = reactive<FormState>({
      showProjectSelect: false,
      currentProject: {
        id: '',
        projectName: '',
        projectTypeName: '',
        constructionSite: '',
        duration: '',
        depName: '',
      },
      result: '',
      remarks: '',
      fileVOS: [],
    })

    const checkProject = (): void => {
      const projectId = sessionStorage.getItem('add-project');
      if (projectId) {
        sessionStorage.removeItem('add-project')
        getProject(projectId)
      }
    }

    const getProject = async (projectId: string): Promise<void> => {
      try {
        const response = await cubeSmallEngineeringService.projectScheduleDetail(projectId)
        formState.currentProject = {
          id: response.id,
          projectName: response.projectName,
          projectTypeName: response.projectTypeName ?? '--',
          constructionSite: response.constructionSite,
          duration: response.duration,
          depName: response.superviseDepList ? response.superviseDepList[0].name : '--',
        }
      } catch {}
    }

    onMounted(() => {
      checkProject()
    })

    const fileMaxCount = 5
    const filedUploadSlots = {
      input: (): JSX.Element => {
        return (
          <div>
            <div class={styles.uploadedList}>
              {
                formState.fileVOS.map((item, index) => {
                  return (
                    <div class={styles.uploaded} key={item.id} onClick={() => {
                      handlePreviewImage(index)
                    }}>
                      <img src={item.path} alt='' width={60} height={60} />
                      <Icon
                        name='clear' size='20px' color='#000'
                        onClick={(e: Event) => {
                          e.stopPropagation()
                          deleteImage(item.id)
                        }}
                      />
                    </div>
                  )
                })
              }
              {formState.fileVOS.length < fileMaxCount &&
              <div class={styles.upload} onClick={handleUploadImage}>
                <Icon name='plus' size='30px' color='#d9d9d9' />
              </div>}
            </div>
          </div>
        )
      }
    }
    const handleUploadImage = async (): Promise<void> => {
      try {
        const result = await cubeAppService.uploadImage(String(fileMaxCount - formState.fileVOS.length), {
          sceneCode: GLOBAL_SCENE_CODE.smallEngineering
        })
        formState.fileVOS = [...formState.fileVOS, ...result]
      } catch {}
    }
    const handlePreviewImage = (showIndex: number): void => {
      showImagePreview(formState.fileVOS.map(item => item.path), showIndex)
    }
    const deleteImage = (id: string): void => {
      formState.fileVOS = formState.fileVOS.filter(item => item.id !== id)
    }

    const handleConfirmSelectProject = (value: Project[]): void => {
      if (value.length === 0) return
      formState.showProjectSelect = false
      formState.currentProject = value[0]
    }

    const handleAddProject = (): void => {
      router.push({
        name: 'project-supervise-add'
      })
    }

    const handleSubmit = async (): Promise<void> => {
      try {
        loading.value = true
        await formRef.value?.validate()
        const params = {
          projectScheduleId: formState.currentProject.id,
          result: formState.result,
          remarks: formState.remarks,
          image: formState.fileVOS.map(item => item.id),
        }
        await cubeSmallEngineeringService.temporaryPatrolAdd(params)
        router.push({
          name: 'temporary-patrol-record'
        })
      } finally {
        loading.value = false
      }
    }

    const resultSlots = {
      input: (): JSX.Element => {
        return (
          <RadioGroup v-model={formState.result} direction="horizontal">
            <Radio name='NORMAL'>正常</Radio>
            <Radio name='ABNORMAL'>异常</Radio>
          </RadioGroup>
        )
      }
    }

    return (): JSX.Element =>
      <div class={styles['temporary-patrol']}>
        <CubeNavBar title='临时巡查' showBack rightText='记录' onClickRight={() => {
          router.push('temporary-patrol-record')
        }} />
        <div class={styles.form}>
          {loading.value && <Loading type='spinner' size='24px' vertical>加载中...</Loading>}
          <Form ref={formRef} label-width='100px'>
            <div class={styles.project}>
              <Field
                v-model={formState.currentProject.projectName}
                label='小散工程'
                required
                readonly
                isLink
                rules={[{ required: true, message: '请选择小散工程' }]}
                onClick={() => {
                  formState.showProjectSelect = true
                }}
              />
              <div class={styles.add} onClick={handleAddProject}>
                <Button icon="plus" type="primary" size="mini" onClick={handleAddProject}>新增</Button>
              </div>
            </div>
            <Field
              v-model={formState.currentProject.projectTypeName}
              label='工程类型'
              required
              readonly
            />
            <Field
              v-model={formState.currentProject.constructionSite}
              label='施工地点'
              maxlength='50'
              required
              readonly
            />
            <Field
              label='工期'
              v-model={formState.currentProject.duration}
              required
              readonly
            />
            <Field
              label='监管部门'
              v-model={formState.currentProject.depName}
              readonly
              required
            />
            <Field
              label='巡查结果'
              rules={[{ required: true, message: '请选择巡查结果' }]}
              readonly
              required
              v-slots={resultSlots}
            />
            <Field
              v-model={formState.remarks}
              label='描述'
              rows='2'
              autosize
              type='textarea'
              maxlength='200'
              placeholder='输入备注'
              show-word-limit
            />
            <Field label='图片' readonly />
            <Field v-slots={filedUploadSlots} readonly />
          </Form>
        </div>
        <div class={styles.footer}>
          <Button block type='primary' loading={loading.value} onClick={handleSubmit}>提交</Button>
        </div>
        <ProjectSelect
          v-model:show={formState.showProjectSelect}
          value={formState.currentProject ? [formState.currentProject] : []}
          onClose={
            () => {
              formState.showProjectSelect = false
            }
          }
          onConfirm={handleConfirmSelectProject}
        />

      </div>
  }
})