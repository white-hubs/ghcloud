import { computed, defineComponent, reactive } from 'vue'
import { Select, Button } from '@ghcloud/cube-ui'
import { ModalTable } from '@ghcloud/generic-component'
import { getDeptListPage, getRoleListPage, getUserListPage } from '@/api'
const messageTargetOptions = [
  {
    label: '部门',
    value: 'DEPARTMENT',
    url: getDeptListPage,
  },
  {
    label: '角色',
    value: 'ROLE',
    url: getRoleListPage,
  },
  {
    label: '用户',
    value: 'USER',
    url: getUserListPage,
  },
]
export const NotifySelectItem = defineComponent({
  setup: () => {
    const state = reactive({
      modalVisible: false,
      selectValue: ''
    })
    const modalColumns = computed(() => {
      const config = (window.config as unknown as { feature?: { usePersonal?: boolean; }; })
      let userColumns: { title: string;dataIndex: string;key: string;customRender?: ({ text }: { text: unknown; }) => string | JSX.Element; }[] = []
      if (config.feature?.usePersonal) {
        userColumns = [
          {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: '联系电话',
            dataIndex: 'mobile',
            key: 'mobile',
          },
          {
            title: '部门',
            dataIndex: 'organizationName',
            key: 'organizationName',
          },
          {
            title: '是否在岗',
            dataIndex: 'onDuty',
            key: 'onDuty',
            customRender: ({ text }): string => {
              return text ? '是' : '否'
            },
          },
          {
            title: '性别',
            dataIndex: 'gender',
            key: 'gender',
            customRender: ({ text }): string => {
              return text as string
            },
          },
        ]
      } else {
        userColumns = [{
          title: '名称',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: '联系电话',
          dataIndex: 'mobile',
          key: 'mobile',
        },
        {
          title: '部门',
          dataIndex: 'organizations',
          key: 'organizations',
          customRender: ({ text }): string => {
            const org = text as { name: string; id: string; }[]
            return org?.[0] ? org[0].name : '--'
          },
        },
        {
          title: '性别',
          dataIndex: 'gender',
          key: 'gender',

          customRender: ({ text }): string => {
            return text === 'MALE' ? '男' : '女'
          },
        }]
      }
      const valueForColumns: Record<string, { title: string;dataIndex: string; key: string; }[]> = {
        DEPARTMENT: [{
          title: '部门名称',
          dataIndex: 'name',
          key: 'name',
        }],
        ROLE: [{
          title: '角色名称',
          dataIndex: 'name',
          key: 'name',
        }],
        USER: userColumns
      }
      return valueForColumns[state.selectValue] || userColumns
    })
    const handleOpenData = (): void => {
      state.modalVisible = true
    }
    const modalFetchFun = computed(() => {
      const selectValueForUrl: Record<string, (params: Record<string, string | null | number | boolean>) => Promise<Service.RequestResult>> = {
        DEPARTMENT: getDeptListPage,
        ROLE: getRoleListPage,
        USER: getUserListPage
      }
      return selectValueForUrl[state.selectValue] ?? getDeptListPage
    })
    const modalTitle = computed(() => {
      const selectValueForTitle: Record<string, string> = {
        DEPARTMENT: '选择部门',
        ROLE: '选择角色',
        USER: '选择用户'
      }
      return selectValueForTitle[state.selectValue] ?? '选择用户'
    })
    return (): JSX.Element => (
      <>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px' }}>
          <Select v-model:value={state.selectValue} options={messageTargetOptions} style={{ width: '180px', marginRight: '10px' }} />
          <Button type='primary' onClick={handleOpenData}>选择</Button>
          <Button type='link' danger>删除</Button>
        </div>
        <ModalTable apiFunction={modalFetchFun.value} title={modalTitle.value} multiple columns={modalColumns.value} v-model:show={state.modalVisible} />
      </>
    )
  }
})
