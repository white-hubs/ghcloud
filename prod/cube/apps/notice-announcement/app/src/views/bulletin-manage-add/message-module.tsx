import { Button, PlusOutlined, Select, Space, Tag } from '@ghcloud/cube-ui'
import { defineComponent, reactive, ref } from 'vue'
import styles from './message.module.less'
import { Popconfirm } from 'ant-design-vue'
import { DeptListModal } from './dep-list-modal'
import { PositionListModal } from './position-list-modal'
import { RoleListModal } from './role-list-modal'
import { TenantUsersListModal } from './tenant-users-list-modal'
export interface SetList {
  way: string[] | string;
  personnelType: string;
  deptIds: { name: string; id: string; }[];
  postIds: { name: string; id: string; }[];
  roleIds: { name: string; id: string; }[];
  userIds: { name: string; id: string; }[];
  [key: string]: any; // 索引签名
}
interface TypeParams {
  [key: string]: string; // 索引签名
  department: string;
  position: string;
  role: string;
  user: string;
}
export const MessageModule = defineComponent({
  setup: (props, { expose }) => {
    const options = [
      { label: '站内信消息', value: 'CHANNEL_SITE' },
      { label: 'app消息', value: 'CHANNEL_APP' },
    ]
    interface PersonnelModal {
      index: number;
      activeId: string[];
      departmentVisible: boolean;
      positionVisible: boolean;
      roleVisible: boolean;
      userVisible: boolean;
      [key: string]: unknown; // 索引签名
    }
    const personnelModal = reactive<PersonnelModal>({
      index: 0,
      activeId: [] as string[],
      departmentVisible: false,
      positionVisible: false,
      roleVisible: false,
      userVisible: false,
    })
    const typeParams: TypeParams = {
      department: 'deptIds',
      position: 'postIds',
      role: 'roleIds',
      user: 'userIds',
    }
    const personnelType = [
      {
        label: '部门',
        value: 'department'
      },
      {
        label: '职位',
        value: 'position'
      },
      {
        label: '角色',
        value: 'role'
      },
      {
        label: '用户',
        value: 'user'
      },
    ]
    const setList = ref<SetList[]>([])
    const addSet = (): void => {
      setList.value.push({
        way: [],
        personnelType: 'department',
        deptIds: [],
        postIds: [],
        roleIds: [],
        userIds: [],
      })
    }
    const deleteItem = (): void => {
    }
    const openPersonnel = (item: SetList, index: number): void => {
      personnelModal.index = index
      if (item.personnelType === 'department') {
        personnelModal.activeId = item.deptIds.map(e => e.id)
      } else if (item.personnelType === 'position') {
        personnelModal.activeId = item.postIds.map(e => e.id)
      } else if (item.personnelType === 'role') {
        personnelModal.activeId = item.roleIds.map(e => e.id)
      } else if (item.personnelType === 'user') {
        personnelModal.activeId = item.roleIds.map(e => e.id)
      }
      personnelModal[item.personnelType + 'Visible'] = true
    }
    const close = (): void => {
      personnelModal.departmentVisible = false
      personnelModal.positionVisible = false
      personnelModal.roleVisible = false
      personnelModal.userVisible = false
      setList.value[personnelModal.index].deptIds = []
      setList.value[personnelModal.index].postIds = []
      setList.value[personnelModal.index].roleIds = []
      setList.value[personnelModal.index].userIds = []
    }
    const save = (selected: string[], selectedRowsData: { name: string; id: string; }[]): void => {
      close()
      if (setList.value[personnelModal.index].personnelType === 'department') {
        setList.value[personnelModal.index].deptIds = selectedRowsData
      } else if (setList.value[personnelModal.index].personnelType === 'position') {
        setList.value[personnelModal.index].postIds = selectedRowsData
      } else if (setList.value[personnelModal.index].personnelType === 'role') {
        setList.value[personnelModal.index].roleIds = selectedRowsData
      } else if (setList.value[personnelModal.index].personnelType === 'user') {
        setList.value[personnelModal.index].userIds = selectedRowsData
      }
    }
    const getData = (): SetList[] => {
      return setList.value
    }
    expose({
      getData
    })
    return (): JSX.Element =>
      <>
        <div class={styles.sub}>
          <div class={styles['add-row']}>
            <Button type='primary' onClick={addSet}>
              添加
              <PlusOutlined />
            </Button>
          </div>
        </div>
        {
          setList.value.map((item, index) => {
            return (
              <div class={styles['config-row']} key={index}>
                <div class={styles.left}>
                  <div class={styles['config-box']}>
                    <div class={styles['box-header']}>
                      <div class={styles['add-row']}>
                        <span>通知方式：</span>
                      </div>
                      <div class={styles['config-row']}>
                        <div class={styles.left}>
                          <Select
                            v-model:value={item.way}
                            showArrow mode='multiple' options={options}
                            style={{ width: '200px' }} placeholder='请选择通知方式'
                          />
                        </div>
                      </div>
                    </div>
                    <div class={styles['box-center']}>
                      <div class={styles['add-row']}>
                        <span>通知人员：</span>
                      </div>
                      <div class='config-row flex-between'>
                        <div class='left' />
                        <Space>
                          <Select
                            v-model:value={item.personnelType}
                            showArrow style={{ width: '200px' }}
                            options={personnelType} placeholder='请选择通知职位'
                          />
                          {

                            item[typeParams[item.personnelType]].map((e: { name: string; }) => {
                              return <Tag>{e.name}</Tag>
                            })
                          }
                          <Button type='primary' onClick={() => {
                            openPersonnel(item, index)
                          }}>添加</Button>
                        </Space>
                      </div>
                    </div>
                  </div>
                </div>
                <div class='right' v-if="type !== 'detail'">
                  <Popconfirm title='删除当前配置?' onConfirm={deleteItem}>
                    <Button type='link' danger>删除</Button>
                  </Popconfirm>
                </div>
              </div>
            )
          })
        }
        <DeptListModal selectedKeys={personnelModal.activeId} onCancel={close} onSave={save} visible={personnelModal.departmentVisible} />
        <PositionListModal selectedKeys={personnelModal.activeId} onCancel={close} onSave={save} visible={personnelModal.positionVisible} />
        <RoleListModal selectedKeys={personnelModal.activeId} onCancel={close} onSave={save} visible={personnelModal.roleVisible} />
        <TenantUsersListModal selectedKeys={personnelModal.activeId} onCancel={close} onSave={save} visible={personnelModal.userVisible} />
      </>
  }
})
