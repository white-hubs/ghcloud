import { defineComponent, ref, computed, watch } from 'vue'
import { Select, Button } from '@ghcloud/cube-ui'
import type { ColumnsType } from '@ghcloud/cube-ui/node_modules/ant-design-vue/es/table/Table'
import { OrgPicker } from '../org-picker'
import { OuaaEnum, ouaaOptions } from './ouaa-picker'
export const OuaaPicker = defineComponent({
  props: ['value', 'defaultValue', 'readonly', 'multiple', 'showBtn', 'type'],
  setup: (props, { emit }) => {
    const orgPickerRef = ref<any>()
    const activeId = ref<string[]>(props.value ? props.value.map((e: { id: string; }) => e.id) : [])
    const selectedRows = ref(props.value ?? [])
    const ouaaName = computed(() => {
      return ouaaOptions.find(e => e.value === props.type)?.label ?? ''
    })
    const search = computed(() => {
      let value = 'name'
      if (props.type === OuaaEnum.USER) {
        value = 'keyword'
      }
      return [
        {
          label: '',
          placeholder: '请输入' + ouaaName.value + '名称',
          value
        }
      ]
    })

    const columns = computed((): ColumnsType => {
      let res: ColumnsType = []
      if (props.type === OuaaEnum.USER) {
        res = [
          {
            title: '人员名称',
            dataIndex: 'name',
            align: 'left'
          },
          {
            title: '性别',
            dataIndex: 'genderName',
            align: 'left'
          },
          {
            title: '联系电话',
            dataIndex: 'mobile',
            align: 'left'
          }
        ]
      } else if (props.type === OuaaEnum.POST) {
        res = [
          {
            title: '岗位',
            dataIndex: 'name',
            align: 'left'
          }
        ]
      } else if (props.type === OuaaEnum.ROLE) {
        res = [
          {
            title: '角色',
            dataIndex: 'name',
            align: 'left'
          }
        ]
      } else if (props.type === OuaaEnum.DEPARTMENT) {
        res = [
          {
            title: '部门',
            dataIndex: 'name',
            align: 'left'
          }
        ]
      }
      return res
    })

    const url = computed(() => {
      let res = ''
      if (props.type === OuaaEnum.USER) {
        res = 'getStaffPage'
      } else if (props.type === OuaaEnum.POST) {
        res = 'getPositionList'
      } else if (props.type === OuaaEnum.ROLE) {
        res = 'getRoleList'
      } else if (props.type === OuaaEnum.DEPARTMENT) {
        res = 'deptList'
      }
      return res
    })

type RawValue = string | number
const userSelect = ref<RawValue[]>(props.value ? props.value.map((e: { id: string; }) => e.id) : [])
const selectOption = ref<{ label: string; value: string; }[]>(
  props.value ? props.value.map((e: { name: string; id: string; }) => { return { label: e.name, value: e.id } }) : []
)
const selectData = ref<{ [x: string]: string;id: string;name: string; }[]>([])
const selected = (
  values: {
    [x: string]: string;id: string;name: string;
  }[]): void => {
  if (values) {
    selectData.value = values
    selectOption.value = values.map(e => {
      return { label: e.name, value: e.id }
    })
    userSelect.value = values.map(e => e.id)
    emit('confirm', values)
    activeId.value = values.map((item: { id: string; }) => {
      return item.id
    })
  }
}
const changeData = (value: any): void => {
  selectData.value = JSON.parse(JSON.stringify(selectData.value)).filter((item: { id: string; }) => {
    if (value?.includes(item.id)) {
      return item
    }
  })
  selectOption.value = selectData.value.map(e => {
    return { label: e.name, value: e.id }
  })
  userSelect.value = selectData.value.map(e => e.id)
  emit('confirm', selectData.value)
  activeId.value = selectData.value.map((item: { id: string; }) => {
    return item.id
  })
}
const unWatch = ref(false)
watch(() => props.value, () => {
  if (unWatch.value) {
    return
  }
  if (props.value) {
    selectData.value = props.value
    selectOption.value = props.value.map((e: { name: any; id: any; }) => {
      return { label: e.name, value: e.id }
    })
  } else {
    selectOption.value = []
    selectData.value = []
  }
  unWatch.value = true
  userSelect.value = props.value ? props.value.map((e: { id: any; }) => e.id) : []
  activeId.value = props.value ? props.value.map((e: { id: any; }) => e.id) : []
  selectedRows.value = props.value
  setTimeout(() => {
    unWatch.value = false
  }, 0)
})
const show = (): void => {
  orgPickerRef.value.show()
}
return (): JSX.Element => 
   (
    <>
      <OrgPicker
        ref={orgPickerRef}
        title={ouaaName.value}
        url={url.value}
        columns={columns.value}
        active-id={activeId.value}
        selected-rows={selectedRows}
        selection-type={props.multiple ? 'checkbox' : 'radio'}
        search={search.value}
        onClose={selected}
      />
      <div>
        <Select
          v-model:value={userSelect.value} style='width: 200px' onChange={changeData} open={false} mode='multiple'
          options={selectOption}
        />
        <Button type='primary' onClick={show}>选择{ouaaName.value}</Button>
      </div>
    </>
  )
}

})
