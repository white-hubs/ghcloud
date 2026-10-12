import { computed, defineComponent, nextTick, onBeforeUnmount, ref, Teleport, Transition, watch } from 'vue'
import styles from './custom-table-column-modal.module.less'
import './transition.less'
import './antd-v2.css'
import { CheckBox } from './check-box'
import { VerticalAlignTopOutlined, CloseOutlined } from '@ant-design/icons-vue'
import Sortable from 'sortablejs'
import { deleteTenantConfig, deleteUserConfig, getAliasTableColumn, saveAliasConfigForTableColumn } from '../alias-achieve/table-column'

type TableColumnItem = ({ title: string; code: string; } & Record<string, unknown>)
interface Props {
  applicationCode: string;
  tableCode: string;
  visible: boolean;
  columns: TableColumnItem[];
}
interface Column {
  title: string; code: string;visible: boolean;sort: number;
}

/** 自定义表格列配置弹窗组件 */
export const CubeCustomTableColumnModal = defineComponent({
  props: {
    applicationCode: { type: String, default: '' },
    tableCode: { type: String, default: '' },
    visible: { type: Boolean, default: false },
    columns: { type: Array as () => { title: string; code: string; }[], default: () => [] }
  },
  emits: ['update:visible', 'save', 'error'],

  setup (props: Props, { emit }) {
    const deleteLoading = ref(false)
    const submitLoading = ref(false)
    const applyToTenant = ref(false)
    const scope = ref<'tenant' | 'user'>('tenant')
    const columnsList = ref<Column[]>([])
    const sortListRef = ref()
    const sortColumnsList = computed(() => {
      const sortList = JSON.parse(JSON.stringify(columnsList.value)) as Column[]
      return sortList.sort((a, b) => a.sort - b.sort)
    })
    let sortableInstance: Sortable
    watch(() => props.visible, async () => {
      if (props.visible) {
        const aliasTableColumnConfig = await getAliasTableColumn({
          applicationCode: props.applicationCode,
          tableCode: props.tableCode,
          columns: props.columns,
          filter: false,
          sort: false
        })
        scope.value = aliasTableColumnConfig.scope
        applyToTenant.value = scope.value === 'tenant'
        columnsList.value = aliasTableColumnConfig.columns
        await (nextTick())
        sortableInstance = new Sortable(sortListRef.value, {
          animation: 150,
          fallbackOnBody: true,
          swapThreshold: 0.65,
          chosenClass: styles['sort-item-chosen'],
          onEnd: function (evt) {
            const { oldIndex, newIndex } = evt
            if (typeof oldIndex === 'number' && typeof newIndex === 'number') {
              move(oldIndex, newIndex)
            }
          },
        })
      }
    }, { immediate: true })
    onBeforeUnmount(() => {
      if (sortableInstance) {
        sortableInstance.destroy()
      }
    })

    return () =>
      <>
        <Teleport to="body">
          <Transition>
            <div class={styles['modal-root']} v-show={props.visible}>
            {
              props.visible &&
              <>
                <div class={styles['modal-mask']}></div>
                <div class={styles['modal-content']}>
                  <div class={styles['modal-header']}>
                    <div class={styles['modal-title']}>选择表头显示内容</div>
                    <svg onClick={closeModal} focusable="false" class="" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true" fill-rule="evenodd" viewBox="64 64 896 896"><path d="M799.86 166.31c.02 0 .04.02.08.06l57.69 57.7c.04.03.05.05.06.08a.12.12 0 010 .06c0 .03-.02.05-.06.09L569.93 512l287.7 287.7c.04.04.05.06.06.09a.12.12 0 010 .07c0 .02-.02.04-.06.08l-57.7 57.69c-.03.04-.05.05-.07.06a.12.12 0 01-.07 0c-.03 0-.05-.02-.09-.06L512 569.93l-287.7 287.7c-.04.04-.06.05-.09.06a.12.12 0 01-.07 0c-.02 0-.04-.02-.08-.06l-57.69-57.7c-.04-.03-.05-.05-.06-.07a.12.12 0 010-.07c0-.03.02-.05.06-.09L454.07 512l-287.7-287.7c-.04-.04-.05-.06-.06-.09a.12.12 0 010-.07c0-.02.02-.04.06-.08l57.7-57.69c.03-.04.05-.05.07-.06a.12.12 0 01.07 0c.03 0 .05.02.09.06L512 454.07l287.7-287.7c.04-.04.06-.05.09-.06a.12.12 0 01.07 0z"></path></svg>
                  </div>
                  <div class={styles['modal-body']}>
                    <div class={styles['select-area']}>
                      <div class={styles['content-title']}>可选属性（共 {props.columns.length} 个）</div>
                      <div class={`${styles.border}`}>
                        <CheckBox
                          label='全选'
                          indeterminate={columnsList.value.filter(e => e.visible).length > 0 && columnsList.value.filter(e => e.visible).length < columnsList.value.length}
                          checked={columnsList.value.filter(e => e.visible).length > 0}
                          onUpdate:checked={handleSelectAll}
                        />
                        <div class={`${styles['table-column-list']}`}>
                          {columnsList.value.map(column =>
                            <div class={`${styles['table-column-item']}`}>
                              <CheckBox label={column.title} key={column.code} checked={column.visible} onUpdate:checked={(checked) => { handleSelect(column, checked) }}></CheckBox>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div class={styles['sort-area']}>
                      <div class={styles['content-title']}>已选属性（共 {columnsList.value.filter(e => e.visible).length} 个）</div>
                      <div class={`${styles.border}`} ref={sortListRef}>
                        {sortColumnsList.value.map(column =>
                            <div class={styles['table-column-sort-item']} key={column.code} v-show={column.visible}>
                              <div class={styles['sort-item-title']}>
                                <svg class={styles['icon-drag']} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4317">
                                  <path d="M362.666667 192m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" fill="#666666" p-id="4318"></path>
                                  <path d="M661.333333 192m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" fill="#666666" p-id="4319"></path>
                                  <path d="M362.666667 512m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" fill="#666666" p-id="4320"></path>
                                  <path d="M661.333333 512m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" fill="#666666" p-id="4321"></path>
                                  <path d="M362.666667 832m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" fill="#666666" p-id="4322"></path>
                                  <path d="M661.333333 832m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" fill="#666666" p-id="4323"></path>
                                </svg>
                                <span>{column.title}</span>
                              </div>
                              <div class={styles['column-sort-operate']}>
                                <VerticalAlignTopOutlined title='置顶' onClick={() => { handleTopping(column) }}/>
                                <CloseOutlined style='margin-left:10px' onClick={() => { handleSelect(column, false) }}/>
                              </div>
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div class={styles['modal-footer']}>
                    <div>
                      <CheckBox label="应用到全局配置" v-model:checked={applyToTenant.value} style='display:none'/>
                      <button class={styles['modal-btn']} type="button" style='margin-right:10px' onClick={reset} v-show={scope.value === 'user'}>
                        {
                          deleteLoading.value &&
                          <span class="ant-btn-loading-icon" style='margin-right:10px'><span role="img" aria-label="loading" class="anticon anticon-loading"><svg focusable="false" class="anticon-spin" data-icon="loading" width="1em" height="1em" fill="currentColor" aria-hidden="true" viewBox="0 0 1024 1024"><path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path></svg></span></span>
                        }
                        <span>恢复至默认设置</span>
                      </button>
                    </div>

                    <div>
                      <button class={styles['modal-btn']} type="button" style='margin-right:10px' onClick={closeModal}><span>取 消</span></button>
                      <button class={`${styles['modal-btn']} ${styles['modal-btn-primary']}`} type="button" onClick={handleConfirm}>
                        {
                          submitLoading.value &&
                          <span class="ant-btn-loading-icon" style='margin-right:10px'><span role="img" aria-label="loading" class="anticon anticon-loading"><svg focusable="false" class="anticon-spin" data-icon="loading" width="1em" height="1em" fill="currentColor" aria-hidden="true" viewBox="0 0 1024 1024"><path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path></svg></span></span>
                        }
                        <span>确 定</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            }
            </div>
          </Transition>
        </Teleport>
      </>

    function closeModal (): void {
      emit('update:visible', false)
    }

    /** 全选 */
    function handleSelectAll (checked: boolean): void {
      columnsList.value.forEach((e, i) => {
        e.visible = checked
        e.sort = i
      })
    }

    /** 选择 */
    function handleSelect (item: Column, checked: boolean): void {
      const findItem = columnsList.value.find(e => e.code === item.code)
      if (findItem) {
        findItem.visible = checked
        // if (!checked) {
        //   findItem.sort = 99
        // }
      }
    }

    /** 置顶 */
    function handleTopping (item: Column): void {
      const findIndex = sortColumnsList.value.findIndex(e => e.code === item.code)
      if (findIndex !== -1) {
        const tempArr = [...sortColumnsList.value]
        tempArr.splice(findIndex, 1)
        tempArr.unshift(sortColumnsList.value[findIndex])
        tempArr.forEach((e, i) => {
          columnsList.value.forEach(item => {
            if (item.code === e.code) {
              item.sort = i
            }
          })
        })
      }
    }

    /** 拖拽排序 */
    function move (oldIndex: number, newIndex: number): void {
      const tempArr = [...sortColumnsList.value]
      tempArr.splice(newIndex, 0, tempArr.splice(oldIndex, 1)[0])
      tempArr.forEach((item, index) => {
        item.sort = index
      })
      tempArr.forEach((e, i) => {
        columnsList.value.forEach(item => {
          if (item.code === e.code) {
            item.sort = i
          }
        })
      })
    }

    /** 通过配置返回用于table组件的 columns */
    function emitSaveEvent (): void {
      const columnConfig = [...sortColumnsList.value].map(e => {
        return {
          code: e.code,
          sort: e.sort,
          visible: e.visible
        }
      })
      const res = props.columns.map(e => {
        const findItem = columnConfig.find(ele => ele.code === e.code) ?? {}
        return {
          ...e,
          ...findItem
        }
      }) as TableColumnItem[]
      emit('save', res)
      closeModal()
    }

    /** 保存配置 */
    async function handleConfirm (): Promise<void> {
      if (submitLoading.value) {
        return
      }
      if (!props.applicationCode || !props.tableCode) {
        alert('应用编码或表编码为空')
        return
      }

      try {
        submitLoading.value = true
        const columnConfig = [...sortColumnsList.value].map(e => {
          return {
            code: e.code,
            sort: e.sort,
            visible: e.visible
          }
        })
        const checkColumns = columnConfig.filter(e => e.visible)
        if (checkColumns.length === 0) {
          emit('error', '请至少选择一个列')
          return
        }
        await saveAliasConfigForTableColumn({
          scope: applyToTenant.value ? 'tenant' : 'user',
          applicationCode: props.applicationCode,
          tableCode: props.tableCode,
          columnConfig
        })
        emitSaveEvent()
      } catch (error) {
        emit('error', '保存失败')
      } finally {
        submitLoading.value = false
      }
    }

    /** 恢复到默认设置（只是删除个人配置） */
    async function reset (): Promise<void> {
      try {
        deleteLoading.value = true
        await deleteUserConfig({
          applicationCode: props.applicationCode,
          tableCode: props.tableCode
        })
        await deleteTenantConfig({
          applicationCode: props.applicationCode,
          tableCode: props.tableCode
        })
        setTimeout(() => {
          emitSaveEvent()
        }, 1000)
      } catch (error) {
        emit('error', '恢复默认设置失败')
      } finally {
        setTimeout(() => {
          deleteLoading.value = false
        }, 1000)
      }
    }
  }
})
