import { Avatar, MinusCircleOutlined, UserOutlined, PopOver, Space, AntModal, ApartmentOutlined, Card, CardMeta, Modal } from '@ghcloud/cube-ui'
import { computed, defineComponent, inject, ref } from 'vue'
import styles from './user-avatar.module.less'
import type { CubeAuth, UserInfo } from '@ghcloud/cube-ouaa-service'
import { CubeMessageEvent } from '@ghcloud/cube-protocol'
import { useClientUIState } from '../../../../hook/use-client'
import { apiProxy } from '../../../../api/server'
import type { Tenant } from '@ghcloud/cube-mdata-service'

interface Props {
  userInfo: UserInfo;
}

export const UserAvatar = defineComponent({
  name: 'UserAvatar',
  props: ['userInfo'],
  setup (props: Props) {
    const authInfo = inject('CUBE_AUTH_INFO') as CubeAuth
    const currentTenantCode = ref(authInfo.tenant)
    const clientUIState = useClientUIState()
    const visible = ref(false)
    const avatarSrc = computed(()=>{
      if (props.userInfo.fileVO?.path){
        return clientUIState.clientBaseUrl + props.userInfo.fileVO.path
      }
      return ''
    })
    const showTenantListModal = ref(false)
    const tenantList = ref<Tenant[]>([])
    const getTenantList = async (): Promise<void> => {
      tenantList.value = await apiProxy.cubeMDataServiceProxy.getTenantMine()
    }
    getTenantList()


    return (): JSX.Element => <>
      <PopOver
        v-model:visible={visible.value}
        trigger="click"
        placement='rightBottom'
        overlayClassName={styles.popover}
        onVisibleChange={(visible: boolean)=>{
          if (visible){
            window.cubeElectronIpcRenderer.send(CubeMessageEvent.DESKTOP_SET_MAIN_VIEW_TO_TOP)
          } else {
            window.cubeElectronIpcRenderer.send(CubeMessageEvent.DESKTOP_SET_MAIN_VIEW_TO_BOTTOM)
          }
        }}
        v-slots={{
          content: () => {
            return (
              <div class={styles.popoverContent}>
                <div class={styles.userInfo}>
                  <div class={styles.userName}>{props.userInfo.name}</div>
                  <div class={styles.department}>{props.userInfo.organizations?.length ? props.userInfo.organizations[0].name : '无所属部门'}</div>
                </div>
                <div class={styles.divider}></div>
                <div class={styles.actionButtons}>
                  <div class={styles.actionButton} onClick={()=>{
                    visible.value = false
                    window.cubeElectronIpcRenderer.send(CubeMessageEvent.TO_BUSINESS_PAGE, { url: clientUIState.clientBaseUrl + '/portal/legacy-personal/info', title: '个人中心' })
                  }}>
                    <Space>
                      <UserOutlined />
                      个人中心
                    </Space>
                  </div>
                  {
                    tenantList.value.length > 1 &&
                    <div class={styles.actionButton} onClick={()=>{
                      visible.value = false
                      showTenantListModal.value = true
                    }}>
                      <Space>
                        <ApartmentOutlined />
                        组织切换
                      </Space>
                    </div>
                  }
                  <div class={styles.actionButton} onClick={()=>{
                    visible.value = false
                    AntModal.confirm({
                      title: '提示',
                      centered: true,
                      content: '是否退出登录',
                      onOk () {
                        window.cubeElectronIpcRenderer.send(CubeMessageEvent.DESKTOP_LOGOUT)
                      },
                      onCancel () {
                      },
                    });
                  }}>
                    <Space>
                      <MinusCircleOutlined />
                      退出登录
                    </Space>
                  </div>
                </div>
              </div>
            )
          }
        }}
      >
        <Avatar class={styles.avatar} size={40} shape='square' src={avatarSrc.value}>{props.userInfo.name.at(0)}</Avatar>
      </PopOver>

      <Modal v-model:visible={showTenantListModal.value} title="选择企业" width="1200" footer={''}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {
            tenantList.value.map((item)=>{
              return (
                <Card key={item.id} class={item.code.toString() === currentTenantCode.value ? 'tenant-selected' : ''}>
                  <CardMeta>
                    {
                      {
                        'title': ()=><div class={'tenant-card'} onClick={()=>{
                          if (item.code.toString() === currentTenantCode.value || !item.enabled){
                            return
                          }
                          window.cubeElectronIpcRenderer.send(CubeMessageEvent.SWITCH_TENANT, { code: item.code.toString() })
                          currentTenantCode.value = item.code.toString()
                        }}>
                          <span>{item.name}</span>
                          <span class={item.enabled ? 'normalRow' : 'deleteRow'}>{item.enabled ? '已启用' : '已禁用'}</span>
                        </div>
                      }
                    }
                  </CardMeta>
                </Card>
              )
            })
          }
        </div>
      </Modal>
    </>
  }
})