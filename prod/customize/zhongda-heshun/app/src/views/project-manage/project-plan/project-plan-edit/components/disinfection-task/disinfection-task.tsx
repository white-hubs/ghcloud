import { defineComponent, ref, type Ref, watch, onMounted } from 'vue'
import { Input, Button, Select, PlusOutlined, message } from '@ghcloud/cube-ui'
import styles from './disinfection-task.module.less'
import type { DisinfectionTaskItem } from './types'
import { cubeOuaaService, cubeZhongdaHeshunService } from '@/api/service'
import type { ProjectAreaVO } from '@ghcloud/cube-zhongda-heshun-service'
import { useRoute } from 'vue-router'

export const DisinfectionTask = defineComponent({
  props: {
    initTasks: {
      type: Array,
      default: () => []
    },
    projectId: {
      type: String,
      default: ''
    }
  },
  setup: (props, { expose }) => {
    const route = useRoute()
    const type = route.query.type as string
    const isDetailView = type === 'info'
    const typeOptions = ref([{
      label: '小组',
      value: 'GROUP'
    },
    {
      label: '部门',
      value: 'DEPT'
    },
    {
      label: '岗位',
      value: 'POST'
    },
    {
      label: '小组+角色',
      value: 'GROUP_ROLE'
    },
    {
      label: '角色',
      value: 'ROLE'
    }])
    const deptTypeOptions = ref<{ label: string; value: string; }[]>()
    const positionTypeOptions = ref<{ label: string; value: string; }[]>()
    const roleTypeOptions = ref<{ label: string; value: string; }[]>()
    const cyleNumber = ref(1)
    // const roleOptions = ref<{ label: string; value: string; }[]>()
    const getGroupList = async (value: string, index: number): Promise<void> =>{
      const data = await cubeZhongdaHeshunService.getProjectGroupPageListAll(value)
      const res = data.map((item) =>{
        return {
          label: item.groupName,
          value: item.id
        }
      })
      tasks.value[index].userTypeOptions = res as { label: string; value: string; } []
    }
    const getGroupRoles = async (projectId: string, groupId: string, index: number): Promise<void> => {
      try {
        const res = await cubeZhongdaHeshunService.getRolesFormGroup({ projectId: projectId, groupId: groupId })
        tasks.value[index].roleOptions = res as { value: string; label: string; } []
      } catch {
      }
    }
    const typeChange = async (value: string, key: number): Promise<void> =>{
      // formRef.notificationValue = null
      tasks.value[key].value1 = null
      tasks.value[key].value2 = null
      if (value === 'GROUP' || value === 'GROUP_ROLE'){
        if (!props.projectId){
          message.error('请选择项目')
          return;
        }
        await getGroupList(props.projectId, key)
      } else if (value === 'DEPT'){
        if (deptTypeOptions.value)
          tasks.value[key].userTypeOptions = deptTypeOptions.value
      } else if (value === 'POST'){
        if (positionTypeOptions.value)
          tasks.value[key].userTypeOptions = positionTypeOptions.value
      } else if (value === 'ROLE'){
        if (roleTypeOptions.value)
          tasks.value[key].userTypeOptions = roleTypeOptions.value
      }
    }
    const getDeptList = async (): Promise<void> =>{
      const data = await cubeOuaaService.getDept({ enabled: true })
      const res = data.map((item) =>{
        return {
          label: item.name,
          value: item.id
        }
      })
      deptTypeOptions.value = res as { label: string; value: string; } []
    }
    const getPosition = async (): Promise<void> =>{
      const data = await cubeOuaaService.getPositionList({ enabled: true })
      const res = data.map((item) =>{
        return {
          label: item.name,
          value: item.id
        }
      })
      positionTypeOptions.value = res as { label: string; value: string; } []
    }
    const getRoleList = async (): Promise<void> =>{
      const data = await cubeOuaaService.getRole({ enabled: true })
      const res = data.map((item) =>{
        return {
          label: item.name,
          value: item.id
        }
      })
      roleTypeOptions.value = res as { label: string; value: string; } []
    }
    const valueChange = async (value: string, key: number): Promise<void> =>{
      tasks.value[key].value2 = null
      if (tasks.value[key].notificationType === 'GROUP_ROLE'){
        getGroupRoles(props.projectId, value, key)
        tasks.value[key].notificationGroupId = value
      } else if (tasks.value[key].notificationType === 'GROUP'){
        tasks.value[key].notificationGroupId = value
      } else if (tasks.value[key].notificationType === 'DEPT'){
        tasks.value[key].notificationDeptId = value
      } else if (tasks.value[key].notificationType === 'POST'){
        tasks.value[key].notificationPostId = value
      } else if (tasks.value[key].notificationType === 'ROLE'){
        tasks.value[key].notificationRoleId = value
      }
    }
    const roleChange = (value: string, key: number): void => {
      tasks.value[key].notificationRoleId = value
    }
    const tasks = ref(props.initTasks.length ? [...props.initTasks] : []) as Ref<DisinfectionTaskItem[]>


    watch(() => (props.initTasks, props.projectId), async () => {
      if (props.projectId){
        getAreaList(props.projectId)
      }
      if (props.initTasks && props.projectId){
        tasks.value = [...props.initTasks as DisinfectionTaskItem[]]
        tasks.value.map(async (item, key) =>{
          item.id = null;
          await typeChange(item.notificationType ?? '', key)
          if (item.notificationType === 'GROUP'){
            item.value1 = item.notificationGroupId
          } else if (item.notificationType === 'DEPT'){
            item.value1 = item.notificationDeptId
          } else if (item.notificationType === 'POST'){
            item.value1 = item.notificationPostId
          } else if (item.notificationType === 'ROLE'){
            item.value1 = item.notificationRoleId
          } else {
            item.value1 = item.notificationGroupId
            item.value2 = item.notificationRoleId
          }
        })
        cyleNumber.value = cyleNumber.value + 1
      }
    })
    onMounted(async () => {
      if (type === 'create'){
        cyleNumber.value = 3
      }
      getDeptList()
      getPosition()
      getRoleList()
    })
    const getAreaList = async (value: string): Promise<void> =>{
      const data = await cubeZhongdaHeshunService.getProjectAreaAll(value)
      areaOptions.value = data
      if (cyleNumber.value > 2){
        tasks.value = []
        areaOptions.value.map((item) =>{
          addTask(item.id)
        })
      }

    }
    const areaOptions = ref<ProjectAreaVO[]>()
    // 添加消杀任务
    const addTask = (taskAreaId?: string): void => {
      tasks.value.push({
        taskAreaId: taskAreaId ?? null,
        disinfectionFrequency: '',
        notificationType: null,
        notificationGroupId: null,
        notificationDeptId: null,
        notificationPostId: null,
        notificationRoleId: null,
        value1: null,
        value2: null,
        userTypeOptions: [],
        roleOptions: []
      })
    }

    // 删除消杀任务
    const removeTask = (index: number): void => {
      tasks.value.splice(index, 1)
    }

    // 获取API参数
    const getApiParams = (): unknown[] => {
      return tasks.value
    }

    // 暴露方法给父组件
    expose({
      getApiParams
    })

    /**
     * @description: 获取通知类型显示文本
     */
    const getNotificationTypeText = (notificationType: string, task: DisinfectionTaskItem): string => {
      const typeMap = {
        'GROUP': '小组',
        'DEPT': '部门',
        'POST': '岗位',
        'GROUP_ROLE': '小组+角色',
        'ROLE': '角色'
      }
      let name = ''
      if (notificationType === 'GROUP'){
        name = task.notificationGroupName ?? ''
      } else if (notificationType === 'DEPT'){
        name = task.notificationDeptName ?? ''
      } else if (notificationType === 'POST'){
        name = task.notificationPostName ?? ''
      } else if (notificationType === 'ROLE'){
        name = task.notificationRoleName ?? ''
      } else if (notificationType === 'GROUP_ROLE'){
        let roles = []
        if (task.notificationGroupName) roles.push(task.notificationGroupName)
        if (task.notificationRoleName) roles.push(task.notificationRoleName)
        name = roles.join(' - ')
      }
      return (typeMap[notificationType as keyof typeof typeMap] + ':' + name) || '--'
    }

    /**
     * @description: 获取区域名称
     */
    const getAreaName = (taskAreaId: string): string => {
      const area = areaOptions.value?.find(item => item.id === taskAreaId)
      return area?.areaName || '--'
    }

    return (): JSX.Element => (
      <div class={styles.container}>
        {!isDetailView && (
          <div class={styles.addTaskBtn}>
            <Button type="primary" onClick={addTask}>
              <PlusOutlined /> 添加
            </Button>
          </div>
        )}

        {tasks.value.map((task, index) => (
          <div key={index} class={styles.taskItem}>
            <div class={styles.taskHeader}>
              <div class={styles.taskTitle}>消杀任务{index + 1}</div>
              {!isDetailView && tasks.value.length > 1 && (
                <Button
                  type="link"
                  danger
                  onClick={() => removeTask(index)}
                  class={styles.removeBtn}
                >
                  删除
                </Button>
              )}
            </div>

            <div class={styles.taskContent}>
              {isDetailView ? (
                // 详情展示模式
                <>
                  <div class={styles.detailRow}>
                    <span class={styles.detailLabel}>任务消杀区域：</span>
                    <span class={styles.detailValue}>{getAreaName(task.taskAreaId ?? '')}</span>
                  </div>

                  <div class={styles.detailRow}>
                    <span class={styles.detailLabel}>消杀频次：</span>
                    <span class={styles.detailValue}>{task.disinfectionFrequency || '--'}</span>
                  </div>

                  <div class={styles.detailRow}>
                    <span class={styles.detailLabel}>消杀人员：</span>
                    <span class={styles.detailValue}>{getNotificationTypeText(task.notificationType ?? '', task)}</span>
                  </div>
                </>
              ) : (
                // 原有的表单编辑模式
                <>
                  <div class={styles.formRow}>
                    <div class={styles.formLabel}>任务消杀区域</div>
                    <Select
                      v-model={[task.taskAreaId, 'value']}
                      placeholder="请选择区域"
                      class={styles.formControl}
                      fieldNames={{ value: 'id', label: 'areaName' }}
                      options={areaOptions.value}
                    >

                    </Select>
                  </div>

                  <div class={styles.formRow}>
                    <div class={styles.formLabel}>消杀频次</div>
                    <Input
                      v-model={[task.disinfectionFrequency, 'value']}
                      placeholder="请输入"
                      class={styles.formControl}
                    />
                  </div>

                  <div class={styles.formRow}>
                    <div class={styles.formLabel}>消杀人员</div>
                    <div class={styles.personnelSelectors}>
                      <Select
                        placeholder="请选择消杀分类"
                        class={styles.personnelSelect}
                        options={typeOptions.value}
                        v-model:value={[task.notificationType, 'value']}
                        style={{ width: '200px' }}

                        onChange={(value) => {
                          typeChange(value, index)
                        }}
                      >
                      </Select>
                      <Select style={{ width: '200px' }} v-model:value={[task.value1, 'value']} class='ml-2' placeholder='请选择消杀子分类' options={task.userTypeOptions} onChange={(value) => {
                        valueChange(value, index)
                      }} />
                      {task.notificationType === 'GROUP_ROLE' && <Select style={{ width: '200px' }} fieldNames={{ label: 'name', value: 'id' }} v-model:value={[task.value2, 'value']} class='ml-2' placeholder='请选择消杀子分类' options={task.roleOptions} onChange={(value) => {
                        roleChange(value, index)
                      }} />}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }
})