import { defineComponent, onMounted, reactive, ref } from 'vue';
import { cubeZhongdaHeshunService } from '@/api/service';
import { useRoute } from 'vue-router';
import { Button, Form, FormItem, Input, message, Modal, PlusCircleOutlined, PopConfirm, PopOver, Spin, Table, type FormExpose } from '@ghcloud/cube-ui';
import styles from './project-group-edit.module.less';
import { ProjectSelect } from '@/components/project-select/project-select';
import { CubeLayout } from '@ghcloud/cube-app-design'
import { SelectUser } from './select-user'
import type { UserInfo } from '@ghcloud/cube-ouaa-service'
interface GroupData {
  id: string;
  name: string;
  phone: string;
  department: string;
  positions: string;
  role: string;
}
interface GroupRequData {
  count: number ;
  groupName: string;
  id: string;
  users: UserInfo[];
}
export const ProjectGroupEdit = defineComponent({
  name: 'ProjectGroupEdit',
  setup () {
    const newProjectId = useRoute().query.projectId;
    const editId = useRoute().query.id;
    const formRef = ref<FormExpose>();
    const defaultSelectedUsers = ref<UserInfo[]>([])
    const formState = reactive<{
      projectId: string | null;
      groupParamList: {
        id?: string;
        groupName: string;
        groupData: GroupData[];
      }[];
    }>({
      projectId: (newProjectId as string) ?? null,
      groupParamList: [],
    });
    const loading = ref(false)
    /**
     * @description: 添加区域项
     */
    const addItem = (): void => {
      addGroupFormState.name = null
      addGroupModal.value = true
    };


    const saveLoading = ref(false);
    /**
     * @description: 保存项目区域
     */
    const save = async (): Promise<void> => {
      try {
        saveLoading.value = true;
        await formRef.value?.validate();
        const params = {
          projectId: formState.projectId ?? '',
          groups: formState.groupParamList.map((item) => {
            return {
              groupId: item.id ?? null,
              groupName: item.groupName,
              userIds: item.groupData.map((item)=>item.id)
            };
          }),
        };
        let error = false;
        if (!formState.groupParamList.length){
          message.error('请添加项目形小组');
          return
        }
        formState.groupParamList.forEach((item) => {
          if (!item.groupData.length) {
            message.error('请填写完整小组信息，小组成员不可为空');
            error = true;
          }
        });
        if (error) {
          return;
        }
        if (newProjectId) {
          const newParams = {
            projectId: params.projectId,
            groupId: params.groups[0].groupId,
            groupName: params.groups[0].groupName,
            userIds: params.groups[0].userIds,
          }
          await cubeZhongdaHeshunService.editProjectGroup(newParams);
        } else {
          await cubeZhongdaHeshunService.addProjectGroup(params);
        }
        message.success('保存成功');
        history.back();
      } finally {
        saveLoading.value = false;
      }
    };

    onMounted(() => {
      if (newProjectId){
        getDetail(newProjectId as string)
      }
    });

    const goBack = (): void => {
      history.back();
    };
    const rules = {
      projectId: [{ required: true, message: '请选择所属项目' }],
    };
    const columns = [
      {
        title: '序号',
        dataIndex: 'index',
        width: 80,
        customRender: ({ index }: { index: number; }): JSX.Element=> {
          return <PopOver content={index + 1}>{index + 1}</PopOver>
        }
      },
      {
        title: '员工姓名',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '电话',
        dataIndex: 'phone',
        key: 'phone',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '部门',
        dataIndex: 'department',
        key: 'department',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '岗位',
        dataIndex: 'positions',
        key: 'positions',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '角色',
        dataIndex: 'role',
        key: 'role',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 250,
        align: 'center',
        customRender: ({ record }: { record: GroupData; }): JSX.Element => {
          return (
            <>
              <PopConfirm title='确认删除该项？' onConfirm={() => {
                deleteUser(record)
              }}>
                <Button type='link' size='small' danger>删除</Button>
              </PopConfirm>
            </>
          )
        }
      },
    ]

    const getDetail = async (projectId: string): Promise<void> => {
      loading.value = true
      const res = await cubeZhongdaHeshunService.getProjectGroupDetail(projectId) as GroupRequData[]
      formState.groupParamList = res.map((item) =>{
        return {
          ...item,
          groupName: item.groupName,
          groupData: item.users.map((item: UserInfo) => ({
            ...item,
            id: item.id,
            name: item.name,
            phone: item.mobile,
            department: item.organization?.name ?? '--',
            positions: item.positions.map((item)=>item.name).join(','),
            role: item.roles.map((item)=>item.name).join(','),
          }))
        }
      }).filter(item => item.id === editId)
      loading.value = false
    }
    const deleteRow = (index: number): void =>{
      formState.groupParamList.splice(index, 1)
    }
    const slots = {
      'layout-content': (): JSX.Element =>{
        return (
          <Spin spinning={loading.value} >
            <div class={styles['area-container']}>
              <Form model={formState} ref={formRef} rules={rules}>
                <FormItem label='所属项目' name='projectId' >
                  <div style={{ width: '60%' }}>
                    <ProjectSelect readonly={newProjectId} v-model:value={formState.projectId} />
                  </div>
                </FormItem>
                {!newProjectId && <span class={styles['add-group']} onClick={addItem}>
                  添加小组 <PlusCircleOutlined />
                </span>}
                {formState.groupParamList.map((item, index) => (
                  <div key={index} class={styles['area-item']}>
                    <div class={styles['group-actions']} >
                      <span>{item.groupName}</span>
                      <div class={styles['button']}>
                        <Button type='link' size='large' style={{ marginright: '20px' }} onClick={()=>addUser(item, index)}> 添加人员 </Button>
                        {!newProjectId && <PopConfirm title='确认删除该项？' onConfirm={() => {
                          deleteRow(index)
                        }}>
                          <Button type='link' size='large' danger>删除</Button>
                        </PopConfirm>}
                      </div>
                    </div>
                    <div onClick={()=>{
                      activeIndex.value = index
                    }}>
                      <Table
                        columns={columns}
                        dataSource={item.groupData}
                        pagination={false}
                        size='middle'
                      />
                    </div>

                  </div>
                ))}
              </Form>
            </div>
          </Spin>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <div class="text-center p-4 bg-white border-t">
            <Button onClick={goBack} style={{ marginRight: '20px' }} >取消</Button>
            <Button type='primary' class="ml-2" loading={saveLoading.value} onClick={save}>保存</Button>
          </div>
        )
      },
    }


    const addGroupModal = ref(false);
    const addGroupFormRef = ref<FormExpose>();
    const activeIndex = ref<number>()
    const addGroupFormState = reactive<{
      name: string | null;
    }>({
      name: null,
    });
    const addGroupFormRules = {
      name: [{ required: true, message: '请填写小组名称' }],
    };
    const addGroup = async (): Promise<void> => {
      try {
        await addGroupFormRef.value?.validate();
        formState.groupParamList.push({
          groupName: addGroupFormState.name ?? '',
          groupData: [],
        });
        addGroupModal.value = false
      } finally {
      }
    };
    const userVisible = ref(false);
    const handleCancel = (): void => {
      userVisible.value = false;
    };
    const deleteUser = (record: GroupData): void =>{
      if (activeIndex.value !== undefined){
        const userIndex = formState.groupParamList[activeIndex.value].groupData.findIndex(
          (user) => user.id === record.id
        );
        if (userIndex > -1) {
          formState.groupParamList[activeIndex.value].groupData.splice(userIndex, 1);
        }
      }
    }
    const addUser = (item: {
      id?: string;
      groupName: string;
      groupData: GroupData[]; }, index: number): void => {
      defaultSelectedUsers.value = item.groupData as unknown as UserInfo[]
      activeIndex.value = index
      userVisible.value = true
    }
    /**
     * @description: 确认添加用户到小组
     * @param {UserInfo[]} users - 选中的用户列表
     */
    const handleConfirm = (users: UserInfo[]): void => {
      userVisible.value = false
      users.map((item)=>{
        if (activeIndex.value !== undefined){
          // 检查用户是否已存在，根据id去重
          const existingUser = formState.groupParamList[activeIndex.value].groupData.find(
            (existingItem) => existingItem.id === item.id
          );

          // 如果用户不存在，则添加
          if (!existingUser) {
            formState.groupParamList[activeIndex.value].groupData.push(
              {
                name: item.name,
                phone: item.mobile,
                department: item.organization?.name ?? '--',
                positions: item.positions.map((item)=>item.name).join(','),
                role: item.roles.map((item)=>item.name).join(','),
                id: item.id,
              }
            )
          }
        }
      })
    }

    return (): JSX.Element => (
      <>
        <CubeLayout title={`${newProjectId ? '编辑' : '新增'}小组`} v-slots={slots} >
        </CubeLayout>
        <Modal
          title="添加小组"
          visible={addGroupModal.value}
          onCancel={()=>{
            addGroupModal.value = false
          }}
          centered
          footer={[
            <Button key="cancel" onClick={()=>{
              addGroupModal.value = false
            }}>
              取消
            </Button>,
            <Button key="confirm" type="primary" onClick={ addGroup}>
              确定
            </Button>
          ]}
          width={500}
        >
          <div style={{ padding: '0px 0', display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <Form model={addGroupFormState} ref={addGroupFormRef} rules={addGroupFormRules}>
              <FormItem label="小组名称" name="name">
                <Input placeholder="请输入小组名称" v-model:value={addGroupFormState.name} style={{ width: '300px' }}></Input>
              </FormItem>
            </Form>
          </div>
        </Modal>
        {userVisible.value && <SelectUser
          defaultSelectedUsers={defaultSelectedUsers.value}
          visible={userVisible.value}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
        />}
      </>
    );
  },
});