import { defineComponent, ref, watch } from 'vue'
import styles from '../knowledge-document-list.module.less'
import { Button, Field, Form } from 'vant'
import { DepartmentCascader, ProductPicker } from '@ghcloud/cube-h5-design'
import { KnowledgeDocumentTypeSelect } from '@/components/knowledge-documet-type-select/knowledge-documet-type-select'

export const FilterDom = defineComponent({
  emits: ['submit'],
  props: {
    searchForm: {
      type: Object,
      default: () => {
        return {
          pageNumber: 0,
          pageSize: 10,
          typeId: '',
          deptId: '',
          productId: '',
        }
      }
    }
  },
  setup: (props, { emit }) => {
    const showDepPicker = ref(false)
    const showProductPicker = ref(false)
    const showDocType = ref(false)
    const docType = ref<{ id: string; name: string; }>({
      id: '',
      name: ''
    })
    const product = ref<{ value: string; text: string; }>({
      value: '',
      text: ''
    })
    const department = ref<{ id: string; name: string; }>({
      id: '',
      name: ''
    })
    const search = ref<Record<string, string | number>>({
      pageNumber: 1,
      pageSize: 10,
      typeId: '',
      deptId: '',
      productId: '',
    })
    watch(() => props.searchForm, () => {
      search.value = props.searchForm
    }, { immediate: true, deep: true })

    return (): JSX.Element =>
      <div class={styles.filter}>
        <Form>
          <p>文档类型</p>
          <div>
            <Field
              style='width:186px'
              v-model={docType.value.name} is-link
              readonly
              name='product'
              placeholder='选择文档类型'
              onClick={() => {
                showDocType.value = true
              }}
            />
            <KnowledgeDocumentTypeSelect
              show={showDocType.value}
              value={docType.value}
              onClose={() => {
                showDocType.value = false
              }}
              onConfirm={(value: { id: string; name: string; }) => {
                docType.value = value
                search.value.typeId = value.id
                showDocType.value = false
              }}
            />
          </div>
          <p>关联产品</p>
          <div>
            <Field
              style='width:186px'
              v-model={product.value.text} is-link
              readonly
              name='product'
              placeholder='选择产品'
              onClick={() => {
                showProductPicker.value = true
              }}
            />
            <ProductPicker
              show={showProductPicker.value}
              value={product.value}
              onClose={() => {
                showProductPicker.value = false
              }}
              onConfirm={(value: { value: string; text: string; }) => {
                product.value = value
                search.value.productId = value.value
                showProductPicker.value = false
              }}
            />
          </div>
          <p>所属部门</p>
          <div>
            <Field
              style='width:186px'
              v-model={department.value.name} is-link
              readonly
              name='department'
              placeholder='选择部门'
              onClick={() => {
                showDepPicker.value = true
              }}
            />
            <DepartmentCascader
              show={showDepPicker.value}
              value={department.value}
              onClose={() => {
                showDepPicker.value = false
              }}
              onConfirm={(value: { id: string; name: string; }) => {
                department.value = value
                search.value.deptId = value.id
                showDepPicker.value = false
              }}
            />
          </div>
        </Form>
        <div class={styles['filter-button']}>
          <div style={{ marginRight: '16px', width: '60px' }} onClick={() => {
            search.value.typeId = '';
            search.value.deptId = '';
            search.value.productId = '';
            department.value = {
              id: '',
              name: ''
            }
            product.value = {
              value: '',
              text: ''
            };
            docType.value = {
              id: '',
              name: ''
            }
          }}>
            重置
          </div>
          <Button block size='small' type='primary' onClick={() => {
            emit('submit', search)
          }}>
            提交
          </Button>
        </div>
      </div>
  }
})
