import { Spin, Tree } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watch } from 'vue'
import { getAreaList } from '../api/mdata'

interface Props {
  multiple: boolean;
  value: string;
  placeholder: string;
  readonly: boolean;
  checkedFirst: boolean;
}

/** 区域选择 */
export const AreaTree = defineComponent({
  props: ['multiple', 'value', 'placeholder', 'readonly', 'checkedFirst'],
  emits: ['update:value','check', 'select', ],
  setup (props: Props, { emit }) {
    const select = ref(props.value)
    const areaOptions = ref<{id:string; name: string; children?: any[]}[]>([])
    const selectedKeys = ref<string[]>([])
    const loading = ref(false)
    onMounted(() => {
      loading.value = true
      getAreaList().then(res => {
        loading.value = false
        areaOptions.value = res.data as {id:string; name: string; children?: any[]}[]
        if(props.checkedFirst){
          selectedKeys.value = [areaOptions.value[0]?.id]
          emit('select', selectedKeys.value)
        }
      }).finally(() => {
        loading.value = false
      })
    })

    watch(() => props.value, () => {
      select.value = props.value ?? ''
    })
    const checkHandle = (value: string[], e: any): void => {
      emit('check', value, e)
    }
    const selectHandle = (value: string[]): void => {
      selectedKeys.value = value
      emit('select', value)
    }
    return () =>
    <>
      <Spin spinning={loading.value}>
          <Tree
              fieldNames={ { title: 'name', key: 'id', children: 'children' } }
              placeholder={props.placeholder ?? '请选择'}
              allow-clear
              multiple={props.multiple ?? false}
              treeData={areaOptions.value}
              v-model:value={select.value}
              v-model:selectedKeys={selectedKeys.value}
              onSelect={selectHandle}
              onCheck={checkHandle}
              disabled={props.readonly}
            >
          </Tree>
      </Spin>
    </>
      
  }
})
