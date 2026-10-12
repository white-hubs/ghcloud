import { defineComponent, reactive, onMounted, ref } from 'vue'
import { Button, Input, Select, Form, Row, Col, FormItem, Tabs, TabPane, type FormExpose } from '@ghcloud/cube-ui'
import { CubeLayout, FileUpload } from '@ghcloud/cube-app-design'
import styles from './project-task.module.less'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import { ProjectSelect } from '@/components/project-select/project-select'
import { ProjectTaskTypeSelect } from '@/components/project-plan-type/project-plan-type'
import type { UserInfo } from '@ghcloud/cube-ouaa-service'
import { cubeOuaaService, cubeZhongdaHeshunService } from '@/api/service'
import { debounce } from 'lodash'
import type { ProjectAreaVO } from '@ghcloud/cube-zhongda-heshun-service'
import { message } from 'ant-design-vue/es'
import type { OSSFile } from '@ghcloud/generic-component'
import InputNumber from '@ghcloud/cube-ui/src/components/input-number/input-number'
import { UserSelectPage } from '@ghcloud/cube-app-design'

interface FormState {
  id?: string;
  taskName?: string;
  projectId?: string;
  taskTypeId?: string;
  taskTimeLimitConfig?: {
    day: string;
    hour: string;
    minute: string;
  };
  projectLeaderId?: string;
  disinfectionFrequency?: string;
  notificationType?: string;
  taskAreaId?: string;
  notificationGroupId?: string;
  notificationDeptId?: string;
  notificationPostId?: string;
  notificationRoleId?: string;
  appendix?: string;
  files?: OSSFile[];
  timeLimitDay?: string;
  timeLimitHour?: string;
  timeLimitMinute?: string;
  notificationValue?: string | null;
}
interface FormStateEdit {
  id?: string;
  taskName?: string;
  projectId?: string;
  taskTypeId?: string;
  taskTimeLimitConfig?: {
    day: string;
    hour: string;
    minute: string;
  };
  projectLeaderId?: string;
  disinfectionFrequency?: string;
  notificationType?: string;
  taskAreaId?: string;
  notificationGroupId?: string;
  notificationDeptId?: string;
  notificationPostId?: string;
  notificationRoleId?: string;
  appendix?: string;
}
interface Props {
  taskTypeId: string;
}
export const ProjectTaskAdd = defineComponent({
  props: {
    taskTypeId: {
      type: String,
      required: true
    },
  },
  emits: ['cancel', 'save'],
  setup: (props: Props, { emit }) => {
    const formRenderRef = ref<FormExpose>()
    const formRef = reactive<FormState>({

      files: [],
      taskTypeId: props.taskTypeId ?? ''
    })

    const rules = {
      taskName: [{ required: true, message: '请输入任务名称' }],
      projectId: [{ required: true, message: '请选择所属项目' }],
      projectLeaderId: [{ required: true, message: '请选择项目负责人' }],
      taskTypeId: [{ required: true, message: '请选择任务类型' }],
      taskAreaId: [{ required: true, message: '请选择任务区域' }],
      notificationValue: [{ required: true, message: '请选择消杀人员' }],
    }
    const userOptions = ref<UserInfo[]>([]);
    const araeoPtions = ref<ProjectAreaVO[]>()
    const typeOptions = ref([{
      label: '小组',
      value: 'GROUP'
    }, {
      label: '部门',
      value: 'DEPT'
    }, {
      label: '岗位',
      value: 'POST'
    }, {
      label: '角色',
      value: 'ROLE'
    }])
    const userTypeOptions = ref<{ label: string; value: string; }[]>()
    const buttonLoading = ref(false)
    onMounted(async () => {
      const options = await cubeOuaaService.getUserList({})
      userOptions.value = options
    })
    const handleCancel = (): void => {
      emit('cancel')
    }

    // const handleSave = async(): void => {
    //   // TODO: form validate
    //   try{
    //     formRenderRef
    //   }
    //   formRef
    //   emit('save', formRef)
    // }
    const handleSave = async (): Promise<void> => {

      try {
        await formRenderRef.value?.validate();
        const params = {
          ...formRef,
        }
        if (formRef.files && formRef.files.length)
          params.appendix = formRef.files.map((file)=>file.id).join(',')
        if (formRef.timeLimitDay || formRef.timeLimitHour || formRef.timeLimitMinute){
          const timeLimit = {
            day: formRef.timeLimitDay ?? '',
            hour: formRef.timeLimitHour ?? '',
            minute: formRef.timeLimitMinute ?? ''
          }
          params.taskTimeLimitConfig = timeLimit ?? null
        }
        delete params.files
        if (formRef.id){
          // editTask(params)
        } else {
          addTask(params)
        }
      // 在这里处理保存逻辑，例如调用API
      } catch {

      }
    };

    const addTask = async (params: FormStateEdit): Promise<void> => {
      buttonLoading.value = true
      try {
        await cubeZhongdaHeshunService.addTaskList(params);
        message.success('保存成功')
        emit('save')
      // 在这里处理保存逻辑，例如调用API
      } catch {
      } finally {
        buttonLoading.value = false
      }
    };
    const projectChange = debounce((value: string): void => {
      getAreaList(value)
      if (formRef.projectId){
        getGroupList(formRef.projectId)
      }
    }, 1000)
    const getAreaList = async (value: string): Promise<void> =>{
      const data = await cubeZhongdaHeshunService.getProjectAreaAll(value)
      araeoPtions.value = data
    }
    const getGroupList = async (value: string): Promise<void> =>{
      const data = await cubeZhongdaHeshunService.getProjectGroupPageListAll(value)
      const res = data.map((item) =>{
        return {
          label: item.groupName,
          value: item.id
        }
      })
      userTypeOptions.value = res as { label: string; value: string; } []
    }
    const typeChange = async (value: string): Promise<void> =>{
      formRef.notificationValue = null
      if (value === 'GROUP'){
        if (!formRef.projectId){
          message.error('请选择项目')
          return;
        }
        getGroupList(formRef.projectId)
      } else if (value === 'DEPT'){
        const options = await cubeOuaaService.getDept({ enabled: true })
        userTypeOptions.value = options.map(option => ({
          label: option.name,
          value: option.id
        }))
      } else if (value === 'POST'){
        const options = await cubeOuaaService.getPositionList({ enabled: true })
        userTypeOptions.value = options.map(option => ({
          label: option.name,
          value: option.id
        }))

      } else if (value === 'ROLE'){
        const options = await cubeOuaaService.getRole({ enabled: true })
        userTypeOptions.value = options.map(option => ({
          label: option.name,
          value: option.id
        }))

      }
    }
    const valueChange = (value: string): void =>{
      switch (formRef.notificationType ?? '') {
        case 'GROUP':
          formRef.notificationGroupId = value
          break
        case 'DEPT':
          formRef.notificationDeptId = value
          break
        case 'POST':
          formRef.notificationPostId = value
          break
        case 'ROLE':
          formRef.notificationRoleId = value
          break
      }
    }
    const slots = {

      'layout-content': (): JSX.Element => {
        return (
          <div class='flex flex-col h-full bg-white'>
            <div class='flex-1 p-4 overflow-y-auto'>
              <Tabs>
                <TabPane tab='基础信息' key='1'>
                  <br />
                  <Form ref={formRenderRef} model={formRef} rules={rules} label-col={{ span: 4 }} wrapper-col={{ span: 18 }}>
                    <Row gutter={24}>
                      <Col span={12}>
                        <FormItem label='任务名称' name='taskName'>
                          <Input v-model:value={formRef.taskName} placeholder='输入计划名称' />
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem label='所属项目' name='projectId'>
                          {/* <Select  placeholder='选择项目' options={[]} /> */}
                          <ProjectSelect v-model:value={formRef.projectId} showAll={false} onChange={(value) => {
                            projectChange(value)
                          }} />
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem label='任务类型' name='taskTypeId'>
                          {/* <Select v-model:value={formRef.taskType} placeholder='选择类型' options={[]} /> */}
                          <ProjectTaskTypeSelect v-model:value={formRef.taskTypeId} />
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem label='任务时限' name='timeLimit'>
                          <div class='flex items-center'>
                            <InputNumber v-model:value={formRef.timeLimitDay} style={{ width: '100px' }} />
                            <span class={styles['mx-2']}>天</span>
                            <InputNumber v-model:value={formRef.timeLimitHour} style={{ width: '100px' }} />
                            <span class={styles['mx-2']}>时</span>
                            <InputNumber v-model:value={formRef.timeLimitMinute} style={{ width: '100px' }} />
                            <span class={styles['mx-2']}>分</span>
                          </div>
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem label='项目负责人' name='projectLeaderId'>
                          <UserSelectPage v-model:value={formRef.projectLeaderId}
                          />
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem label='任务消杀区域' name='taskAreaId'>
                          <Select v-model:value={formRef.taskAreaId} placeholder='下拉选择' fieldNames={{ value: 'id', label: 'areaName' }} options={araeoPtions.value} />
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem label='消杀频次' name='disinfectionFrequency'>
                          <Input v-model:value={formRef.disinfectionFrequency} placeholder='输入频次' />
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem label='消杀人员' name='notificationValue'>
                          <div class={styles['flex']}>
                            <Select v-model:value={formRef.notificationType} style={{ width: '50%' }} placeholder='请选择消杀分类' options={typeOptions.value} onChange={(value) => {
                              typeChange(value)
                            }} />
                            <Select v-model:value={formRef.notificationValue} style={{ width: '50%' }} class='ml-2' placeholder='请选择消杀子分类' options={userTypeOptions.value} onChange={(value) => {
                              valueChange(value)
                            }} />
                          </div>
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem label='附件' name='files'>
                          <FileUpload
                            sceneCode={GLOBAL_SCENE_CODE.disinfectiontask}
                            v-model:value={formRef.files}
                            showText={true}
                            maxCount={1}
                            type='picture-card'
                            size={100}
                            customText='支持jpg,png,svg,doc,docx,xls,xlsx,pptx,pdf格式,单个附件最大支持100MB'
                            typeList={['.jpg', '.png', '.svg', '.doc', '.docx', '.xls', '.xlsx', '.pptx', '.pdf']}
                          />
                        </FormItem>
                      </Col>
                    </Row>
                  </Form>
                </TabPane>
              </Tabs>

            </div>

          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <div class='flex-shrink-0 p-4 text-right border-t'>
            <Button onClick={handleCancel} class={styles['mr-2']}>取消</Button>
            <Button type='primary' loading={buttonLoading.value} onClick={handleSave}>保存</Button>
          </div>
        )
      },
    }

    return (): JSX.Element => (
      <CubeLayout title={'新增'} v-slots={slots} showTableXScroll />
    )
  }
})