import { defineComponent, onMounted, ref, type Ref } from 'vue'
import { Button, Descriptions, DescriptionsItem, TabPane, Tabs } from '@ghcloud/cube-ui'
import { Layout } from '@/components/layout/layout'
import type { CompanyVO } from '@ghcloud/cube-operating-room-service'
import { BaseInfo } from './components/base-info/base-info'
import { ReportTemplate } from './components/report-template/report-template'
import { storeDetection } from '@/store/detection'
import { cubeOperatingRoomService } from '@/api/service'
import { message } from 'ant-design-vue/es'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'

export const ReportSetInfo = defineComponent({
  setup () {
    const route = useRoute()
    const tenantId = route.query.tenantId as string
    const detectionStore = storeDetection()
    const activeKey = ref(0)
    const companyInfo = ref<CompanyVO>(detectionStore.company || {})
    const baseInfoRef = ref<{ validate: () => Promise<CompanyVO>; formState: Ref<CompanyVO>; }>()
    const reportTemplateRef = ref<{ getContent: () => string; }>()

    const saveLoading = ref(false)
    const save = async (): Promise<void> => {
      try {
        const result = await baseInfoRef.value?.validate()
        const content = reportTemplateRef.value?.getContent()
        saveLoading.value = true
        const params = {
          ...result,
          tenantId: tenantId ?? '',
          templateContent: content ?? '',
        }
        if (params.fileVO) delete params.fileVO
        await cubeOperatingRoomService.updateCompany(params)
        message.success('保存成功')
        getCompanyInfo()
      } catch (error) {
        if ((error as { errorFields: unknown[]; }).errorFields) {
          activeKey.value = 0
        }
      } finally {
        saveLoading.value = false
      }
    }
    const goBack = (): void => {
      history.back()
    }
    const getCompanyInfo = async (): Promise<void> => {
      companyInfo.value = await cubeOperatingRoomService.getCompanyDetail(tenantId ?? '')
      detectionStore.setCompany(companyInfo.value)
    }
    onMounted(async () => {
      await getCompanyInfo()
    })
    const layoutSlots = {
      'layout-content': (): JSX.Element | void => {
        return (
          <div style={{ marginTop: '15px' }}>
            <Descriptions column={{ md: 3, xl: 5 }} >
              <DescriptionsItem label='受检单位' >{companyInfo.value?.tenantName || '--'}</DescriptionsItem>
              <DescriptionsItem label='校准期' >{companyInfo.value?.calibrationExpireTime ? dayjs(companyInfo.value?.calibrationExpireTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</DescriptionsItem>
              <DescriptionsItem label='检测公司' >{companyInfo.value?.detectionCompany || '--'}</DescriptionsItem>
              <DescriptionsItem label='检测地址' >{companyInfo.value?.detectionAddress || '--'}</DescriptionsItem>
              <DescriptionsItem label='检测电话' >{companyInfo.value?.detectionPhone || '--'}</DescriptionsItem>
            </Descriptions>
            <Tabs v-model:activeKey={activeKey.value} style={{ marginTop: '-10px' }} >
              <TabPane key={0} tab='基础信息'>
                <BaseInfo ref={baseInfoRef} />
              </TabPane>
              <TabPane key={1} tab='报告模版'>
                <ReportTemplate ref={reportTemplateRef} />
              </TabPane>
            </Tabs>
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button onClick={goBack}>返回</Button>
            <Button type='primary' style={{ marginLeft: '10px' }} loading={saveLoading.value} onClick={save}>保存</Button>
          </>
        )
      }
    }
    return (): JSX.Element=> <Layout title={'报告设置'} v-slots={layoutSlots} />
  }
})