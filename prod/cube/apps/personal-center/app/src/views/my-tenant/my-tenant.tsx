import {
  defineComponent,
  onMounted,
  reactive,
  type VNode
} from 'vue'
import { Image, Spin, Card, CardMeta, Empty, Button } from '@ghcloud/cube-ui'
const marketPng = '/resource/v1/personal-center/images/market.png'
import { GLayout } from '@/components/common/layout'
import { cubeMdataService, cubeOuaaService } from '@/api/service'
import type { Tenant } from '@ghcloud/cube-mdata-service'
import styles from './my-tenant.module.less'
export const MyTenant = defineComponent({
  setup: () => {
    const formState = reactive<
      {
        tenant: Tenant[];
        loading: boolean;
        enabled: boolean;
      }>({
      tenant: [],
      loading: false,
      enabled: true,
    })

    const getData = async (): Promise<void> => {
      formState.loading = true
      formState.tenant = await cubeMdataService.getTenantMine()
      formState.loading = false
    }

    const setEnterprise = async (item: Tenant): Promise<void> => {
      await cubeOuaaService.setEnterprise(item.code ?? 0)
      getData()
    }

    onMounted(async () => {
      getData()
    })
    const cardMetaDom = (item: Tenant): { title: () => VNode; description: () => VNode; } => {
      return {
        title: () =>
          <>
            <div>{item?.name}</div>
            <span class={item?.enabled ? styles.normalRow : styles.deleteRow}>{item?.enabled ? '已启用' : '已禁用'}</span>
          </>,
        description: () =>
          <>
            {!item?.mainEnterprise

              ? <Button type='link' class={styles.setMainTenant} onClick={async () => setEnterprise(item)}>设为主企业</Button>
              : <span class={` ${styles.setMainTenant}`}>主企业</span>
            }
          </>
      }
    }

    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-table': (): JSX.Element => {
        return (
          <div class={styles.dataTitle}>
            <Spin spinning={formState.loading}>
              {
                formState.tenant &&
                formState.tenant.length > 0
                  ? <div class={styles.dataDetails}>{formState.tenant.map((item) => <Card class={styles.card} key={item.id} v-slots={{ cover: () => <Image src={marketPng} width='78px' height='78px' /> }}><CardMeta class={styles.pl1} v-slots={cardMetaDom(item)} /></Card>)} </div>
                  : <Empty description='当前暂无企业' />
              }
            </Spin>
          </div>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <GLayout title='我的企业' showFooter={false} v-slots={gLayoutSlots} />
      </>
  }
})
