import { defineComponent, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, Select, type FormExpose, message } from '@ghcloud/cube-ui'
import { ProductCategoryTreeSelect } from '@/components/business/product-category-tree-select/product-category-tree-select'
import { cubeDeviceCenterService } from '@/api/service'

/** 产品新增 */
export const ProductAdd = defineComponent({
  setup: () => {
    const formState = reactive<{
      prodName: string;
      prodCategoryId: string[];
      prodBrandId: string | undefined;
      nodeType: number | undefined;
      accessTypeId: string | undefined;
      protocolId: string | undefined;
    }>({
      prodName: '',
      prodCategoryId: [],
      prodBrandId: undefined,
      nodeType: undefined,
      accessTypeId: undefined,
      protocolId: undefined,
    })
    const formRules = {
      prodName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
      prodCategoryId: [{ required: true, message: '请选择产品品类', trigger: 'change' }],
      prodBrandId: [{ required: true, message: '请选择品牌', trigger: 'change' }],
      nodeType: [{ required: true, message: '请选择节点类型', trigger: 'change' }],
      accessTypeId: [{ required: true, message: '请选择接入方式', trigger: 'change' }],
      protocolId: [{ required: true, message: '请选择协议插件', trigger: 'change' }],
    }
    const formInstance = ref<FormExpose>()
    const loading = ref(false)
    const brandOptions = ref<{ label: string; value: string; }[]>([])
    const protocolOptions = ref<{ label: string; value: string; }[]>([])
    const accessTypeOptions = ref<{ label: string; value: string; }[]>([])

    cubeDeviceCenterService.getProductBrandPage({ pageNumber: 1, pageSize: 10000 }).then(res => {
      brandOptions.value = res.records.map(e => {
        return {
          label: e.itemLabel,
          value: e.id,
        }
      })
    })
    cubeDeviceCenterService.getProtocolList().then(res => {
      protocolOptions.value = res.map(e => {
        return {
          label: e.itemLabel,
          value: e.id,
        }
      })
    })

    const save = async (): Promise<void> => {
      formInstance.value?.clearValidate()
      await formInstance.value?.validate()
      loading.value = true
      const params = {
        prodName: formState.prodName,
        prodCategoryId: formState.prodCategoryId.length > 0 ? formState.prodCategoryId[formState.prodCategoryId.length - 1] : '',
        prodBrandId: formState.prodBrandId!,
        nodeType: formState.nodeType!,
        accessTypeId: formState.accessTypeId!,
        protocolId: formState.protocolId!,
      }
      cubeDeviceCenterService.addProduct(params).then(() => {
        loading.value = false
        message.success('新增成功')
        history.back()
      }).catch((error) => {
        message.error(error?.errorMessage ?? '新增失败')
        loading.value = false
      })

    }

    const layoutSlots = {
      'layout-content': (): JSX.Element=> {
        return (
          <>
            <Form rules={formRules} ref={formInstance} model={formState} style={{ width: '50%', margin: '10px' }}>
              <FormItem label='产品名称' name='prodName'>
                <Input v-model:value={formState.prodName} placeholder='请输入产品名称' showCount={false} />
              </FormItem>
              <FormItem label='产品品类' name='prodCategoryId'>
                <ProductCategoryTreeSelect v-model:value={formState.prodCategoryId} style={{ width: '100%' }} />
              </FormItem>
              <FormItem label='品牌名称' name='prodBrandId'>
                <Select
                  options={brandOptions.value}
                  placeholder='请选择品牌' v-model:value={formState.prodBrandId}
                />
              </FormItem>
              <FormItem label='节点类型' name='nodeType'>
                <Select
                  options={[
                    { label: '直连设备', value: 1 },
                    { label: '网关设备', value: 2 },
                    { label: '网关子设备', value: 3 },
                  ]}
                  placeholder='选择节点类型' v-model:value={formState.nodeType}
                  onChange={() => {
                    formState.accessTypeId = undefined
                    if (!formState.nodeType) {
                      return
                    }
                    cubeDeviceCenterService.getAccModel(formState.nodeType).then(res => {
                      accessTypeOptions.value = res.map(e => {
                        return {
                          label: e.itemLabel,
                          value: e.id,
                        }
                      })
                    })
                  }}
                />
              </FormItem>
              <FormItem label='接入方式' name='accessTypeId'>
                <Select
                  options={accessTypeOptions.value}
                  placeholder='请选择接入方式' v-model:value={formState.accessTypeId}
                />
              </FormItem>
              <FormItem label='协议插件' name='protocolId'>
                <Select
                  options={protocolOptions.value}
                  placeholder='请选择协议插件' v-model:value={formState.protocolId}
                />
              </FormItem>
            </Form>
          </>
        )
      },
      'footer-page': (): JSX.Element=> {
        return (
          <>
            <Button onClick={() => {
              history.back()
            }}>返回</Button>
            <Button style={{ marginLeft: '10px' }} type='primary' onClick={save}>保存</Button>
          </>

        )
      }
    }
    return (): JSX.Element=>
      <>
        <Layout title='新增产品' v-slots={layoutSlots} />
      </>
  }
})
