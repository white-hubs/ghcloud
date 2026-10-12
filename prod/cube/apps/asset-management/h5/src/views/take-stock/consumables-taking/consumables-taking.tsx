import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { CellGroup, Cell, Image, Field, showNotify, Button, Form } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import { useMetaTitle } from '@/hooks/use-meta-title-hook'
import styles from './consumables-taking.module.less'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import type { CheckAsset } from '@ghcloud/cube-asset-management-service'
import { cubeAssetManagementService } from '@/api/server'
interface FormDataType {
  checkId: string;
  consumableId: string;
  num: number;
  checkNum: number;
  remark: string;
  status: string;
}
export const ConsumablesTaking = defineComponent({
  setup: () => {
    const route = useRoute()
    const router = useRouter()
    const detail = ref<CheckAsset>()
    const amount = ref(0)
    const formData = reactive<FormDataType>({
      checkId: route.query.checkId as string ?? '',
      consumableId: route.query.id as string ?? '',
      status: 'COMPLETED',
      num: 0,
      checkNum: 0,
      remark: ''
    })
    const loading = ref(false)
    onMounted(async () => {
      useMetaTitle()
      initData()
    })
    const initData = async (): Promise<void> => {
      try {
        const { records } = await cubeAssetManagementService.getConsumableCheckDetailPage({
          checkId: route.query.checkId as string ?? '',
          id: route.query.id as string ?? '',
          pageNumber: 1,
          pageSize: 1
        })
        detail.value = records[0]
        formData.num = detail.value.checkTotalNumber ?? ''
        formData.checkNum = detail.value.checkTotalNumber ?? ''
        amount.value = detail.value.checkTotalNumber * detail.value.avgPrice
        formData.remark = detail.value.remark ?? ''
      } catch (err) {
        showNotify({ type: 'danger', message: (err as { errorMessage: string; }).errorMessage })
      }
    }
    // 提交
    const submit = async (): Promise<void> => {
      try {
        loading.value = true
        const total = detail.value?.checkTotalNumber ?? 0
        if (formData.checkNum === total)formData.status = 'COMPLETED'
        if (formData.checkNum > total)formData.status = 'WIN'
        if (formData.checkNum < total)formData.status = 'LOSS'
        await cubeAssetManagementService.addConsumableCheckDetail(formData)
        showNotify({ type: 'success', message: '盘点成功' })
        router.go(-1)
      } catch (err) {
        showNotify({ type: 'danger', message: (err as { errorMessage: string; }).errorMessage })
      } finally {
        loading.value = false
      }
    }
    watch(() => formData.checkNum, () => {
      const checkTotalNumber = formData.checkNum ?? 0
      const avgPrice = detail.value?.avgPrice ?? 0
      amount.value = checkTotalNumber * avgPrice
    })
    return (): JSX.Element =>
      <div style={{ background: '#f3f7fa', height: '100vh', position: 'relative' }}>
        <CubeNavBar showBack title='耗材详情' />
        <CellGroup class={styles['cell-group']} key={detail.value?.name}>
          <Cell class={styles.cell}>
            <div class={styles.header}>
              <Image
                class={styles.img}
                src={detail.value?.file?.[0]?.path}
                width='70' height='70' alt=''
              />
              <div>
                <div style='font-weight:500;color:#323233'>{detail.value?.name}</div>
                <div> 耗材编码：{detail.value?.code}</div>
              </div>
            </div>
            <div class={styles.content}>
              <span>单价：{detail.value?.avgPrice}</span>
              <span>单位：{detail.value?.unit}</span>
              <span>品牌：{detail.value?.brand || '--'}</span>
              <span>总金额：¥{detail.value?.amount}</span>
              <span>库存区间：{detail.value?.stockMin ?? 0}-{detail.value?.stockMin ?? 0}</span>
            </div>
            <div class={styles.footer}>
              <div>
                <div>应盘数量</div>
                <div style='font-size:12px;color:#000000'>{detail.value?.checkTotalNumber}</div>
              </div>
              <div>
                <div>单价</div>
                <div style='font-size:12px;color:#000000'>¥{detail.value?.avgPrice}</div>
              </div>
              <div>
                <div>合计数量</div>
                <div style='font-size:12px;color:#000000'>¥{detail.value?.amount}</div>
              </div>
            </div>
          </Cell>
        </CellGroup>
        <CellGroup style='margin-top:10px;'>
          <Form>
            <Field
              label-width='122'
              placeholder='请输入数量'
              name='receiveUserName'
              label='实盘数量'
              v-model={formData.checkNum}
            />
            <Field
              label-width='122'
              name='receiveDepName'
              label='实盘金额'
              readonly
              v-model={amount.value}
            />
            <Field
              label-width='122'
              placeholder='请输入备注描述'
              maxlength='200'
              show-word-limit
              name='storageLocation'
              label='备注'
              type='textarea'
              v-model={formData.remark}
              show
            />
          </Form>
        </CellGroup>
        <div class={styles.button}>
          <Button block size='small' type='primary' onClick={submit} loading={loading.value}>提交</Button>
        </div>
      </div>
  }
})
