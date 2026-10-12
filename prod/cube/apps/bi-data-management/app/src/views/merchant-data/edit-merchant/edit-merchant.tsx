import { defineComponent, onMounted, reactive, ref } from 'vue'
import styles from './index.module.less'
import { Layout } from '@/components/layout/layout'
import { Form, FormItem, Input, Row, Col, Cascader, Select, Button, type FormInstance, message, InputNumber } from '@ghcloud/cube-ui'
import { cubeBiDataManagementService } from '@/api/service'
import { useRoute } from 'vue-router'
import { genderOptions, businessScopeOptions, vehicleTypeOptions } from '@/constants'
import type { MerchantInfoVo, RegionTreeVo } from '@ghcloud/cube-bi-data-management'
type MerchantType = 'PURCHASER' | 'WHOLESALER'
export const EditMerchant = defineComponent({
  setup: () => {
    const formRef = ref<FormInstance>()
    const route = useRoute()
    const type = route.query.type as 'edit' | 'add'
    const id = route.query.id as string
    const merchantType = route.query.merchantType as MerchantType
    const state = reactive<{
      loading: boolean;
      formState: MerchantInfoVo;
      cascaderState: {
        nativePlaceIds: number[];
        upstreamSourceIds: number[];
      };
      regionOptions: RegionTreeVo[];
    }>({
      loading: false,
      cascaderState: {
        nativePlaceIds: [],
        upstreamSourceIds: []
      },
      regionOptions: [],
      formState: {
        name: '',
        sex: '',
        age: '',
        area: '',
        businessScaleNumber: '',
        merchantType: 'PURCHASER',
        vehicleType: '',
        businessScope: '',
        id: '',
        updateTime: new Date().getTime(),
        createTime: new Date().getTime(),
        createBy: '',
        nativePlaceIds: '',
        nativePlace: '',
        upstreamSourceIds: '',
        upstreamSource: '',
        businessScale: ''
      }
    })
    const rules = {
      name: [
        {
          required: true,
          message: '请输入商户名称',
          trigger: 'blur'
        }
      ],
      sex: [
        {
          required: true,
          message: '请选择性别',
          trigger: 'blur'
        }
      ],
      age: [
        {
          required: true,
          message: '请输入年龄',
          trigger: 'blur'
        }
      ],
      area: [
        {
          required: true,
          message: '请输入区域',
          trigger: 'blur'
        }
      ],
      businessScope: [
        {
          required: true,
          message: '请选择经营类型',
          trigger: 'blur'
        }
      ],
      vehicleType: [
        {
          required: true,
          message: '请选择采购车类型',
          trigger: 'blur'
        }
      ],
    }
    const handleSubmit = async (): Promise<void> => {
      await formRef.value?.validate()
      try {
        state.loading = true
        const params = {
          ...state.formState,
          nativePlaceIds: state.cascaderState.nativePlaceIds.join(','),
          upstreamSourceIds: state.cascaderState.upstreamSourceIds.join(',')
        }
        type === 'add' ? await cubeBiDataManagementService.createMerchantInfo({ ...params }) : await cubeBiDataManagementService.editMerchantInfo({ ...params })
        history.back()
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage || '请求失败')
      } finally {
        state.loading = false
      }
    }
    onMounted(() => {
      state.formState.merchantType = merchantType
      if (type === 'edit') {
        getDetail()
      }
      if (merchantType === 'WHOLESALER') {
        getAreaTree()
      }
    })
    const getDetail = async (): Promise<void> => {
      try {
        const result = await cubeBiDataManagementService.getMerchantInfoDetail({ id })
        state.formState = result
        state.cascaderState.nativePlaceIds = result.nativePlaceIds.split(',').map(Number)
        state.cascaderState.upstreamSourceIds = result.upstreamSourceIds.split(',').map(Number)
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage || '请求失败')
      }
    }
    const getAreaTree = async (): Promise<void> => {
      const result = await cubeBiDataManagementService.getRegionTree({
        deep: 1
      })
      state.regionOptions = result
    }
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form ref={formRef} style={{ marginTop: '12px' }} rules={rules} model={state.formState}>
              <Row>
                <Col span={12}>
                  <FormItem label='商户名称' name='name'>
                    <Input v-model:value={state.formState.name} placeholder='请输入商户名称' />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label='性别' name='sex'>
                    <Select options={genderOptions} v-model:value={state.formState.sex} placeholder='请选择性别' />
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <FormItem label='年龄' name='age'>
                    <InputNumber min={0} v-model:value={state.formState.age} placeholder='请输入年龄' />
                  </FormItem>
                </Col>
                <Col span={12}>
                  {merchantType === 'PURCHASER' &&
                    <FormItem label='区域' name='area'>
                      <Input v-model:value={state.formState.area} placeholder='请输入区域' />
                    </FormItem>}
                  {
                    merchantType === 'WHOLESALER' &&
                      <FormItem label='籍贯' name='nativePlaceIds'>
                        <Cascader fieldNames={{ value: 'id', label: 'name', children: 'childList' }} options={state.regionOptions} v-model:value={state.cascaderState.nativePlaceIds} placeholder='请输入区域' />
                      </FormItem>
                  }

                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  {
                    merchantType === 'PURCHASER' &&
                    <FormItem label='经营类型' name='businessScope'>
                      <Select options={businessScopeOptions} v-model:value={state.formState.businessScope} placeholder='请选择经营类型' />
                    </FormItem>
                  }
                  {
                    merchantType === 'WHOLESALER' &&
                    <FormItem label='上游来源' name='upstreamSource'>
                      <Cascader fieldNames={{ value: 'id', label: 'name', children: 'childList' }} options={state.regionOptions} v-model:value={state.cascaderState.upstreamSourceIds} placeholder='请输入区域' />
                    </FormItem>
                  }

                </Col>
                <Col span={12}>
                  {
                    merchantType === 'PURCHASER' &&
                    <FormItem label='采购车类型' name='vehicleType'>
                      <Select options={vehicleTypeOptions} v-model:value={state.formState.vehicleType} placeholder='请选择采购车类型' />
                    </FormItem>
                  }
                  {
                    merchantType === 'WHOLESALER' &&
                    <FormItem label='经营规模' name='businessScaleNumber'>
                      <InputNumber min={0} v-model:value={state.formState.businessScaleNumber} placeholder='请输入经营规模' />
                    </FormItem>
                  }

                </Col>
              </Row>
            </Form>
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button onClick={() => {
              history.back()
            }}
            >返回
            </Button>
            <Button type='primary' loading={state.loading} onClick={handleSubmit}>保存</Button>
          </div>
        )
      }
    }
    return (): JSX.Element => (
      <Layout v-slots={layoutSlots} class={styles.container} title={`${type === 'add' ? '新增' : '编辑'}采购商`} />
    )
  }
})
