import {
  defineComponent,
  onMounted,
  reactive,
  ref,
  type VNode
} from 'vue'
import { Button, Form, FormItem, Image, Input, message, Modal, Radio, RadioGroup, Spin } from '@ghcloud/cube-ui'
import { cubeOuaaService } from '@/api/service'
import type { UserInfo } from '@ghcloud/cube-ouaa-service'
import { GLayout } from '@/components/common/layout'
import { GUpload } from '@/components/common/upload'
import { timeFormat } from '@/utils/common'
import '../style/index.less'
export const PersonalInfo = defineComponent({
  setup: () => {
    const file = ref('')
    const imageUrl = ref()
    const showModal = ref(false)
    const showPhoneModal = ref(false)
    const formState = reactive<{ data: UserInfo;loading: boolean; isEdit: boolean; userId: string; }>({
      data: {
        id: '',
        mobile: '',
        name: '',
        gender: 'MALE',
        fileId: '',
        remark: '',
        createTime: 0,
        lastLoginTime: 0,
        code: '',
        workStatus: '',
        enabled: false,
        entryDate: null,
        photographKey: null,
        organizations: [],
        managedOrganizations: [],
        organization: null,
        positions: [],
        fileVO: {
          id: '',
          name: '',
          path: ''
        },
        tenants: [],
        roles: []
      },
      loading: false,
      isEdit: false,
      userId: '',
    })

    const edit = (): void => {
      formState.isEdit = true
    }

    const cancel = (): void => {
      getUser()
      formState.isEdit = false
    }

    const save = async (): Promise<void> => {
      await cubeOuaaService.updateUserInfo(formState.data)
      message.success('操作成功')
      formState.isEdit = false
      window.location.reload()
    }

    const getUser = async (): Promise<void> => {
      formState.loading = true
      try {
        const res = await cubeOuaaService.getUserInfo()
        formState.data = res
        Object.assign(formState.data, {
          fileId: res.fileVO ? res.fileVO.id : '',
        })
        file.value = res.fileVO?.path ?? ''
        if (res.fileVO) {
          imageUrl.value = `${res.fileVO.path}`
        }
        sessionStorage.setItem('GH-UserInfo', JSON.stringify(formState.data))
      } catch {
      }
      formState.loading = false
    }

    const changeFile = (ids: string[], file: {
      id: string;
      name: string;
      path: string;
    }[]): void => {
      if (ids[0]) {
        formState.data.fileId = ids[0]
        formState.data.fileVO = file[0]
      } else {
        formState.data.fileId = ''
        imageUrl.value = null
      }
    }
    const wechatLogin = async (code: string): Promise<void> => {
      formState.loading = true
      try {
        const res = await cubeOuaaService.bindWechat({ code })
        sessionStorage.setItem('GH-UserInfo', JSON.stringify(res))
        getUser()
      } catch {
      } finally {
        formState.loading = false
      }
    }
    onMounted(async () => {
      formState.userId = JSON.parse(sessionStorage.getItem('GH-UserInfo') ?? '')?.id

      if (window.location.href.indexOf('code') >= 0) {
        let code = window.location.href.split('?')[1];
        code = code.substring(5, code.indexOf('&'));
        const wxCode = sessionStorage.getItem('wx-login-code')
        if (wxCode !== code){
          sessionStorage.setItem('wx-login-code', code)
          wechatLogin(code);
        }

        // 这里可以调用后端接口，将code发送给后端进行验证和登录
        //
      }
      getUser()
    })
    const bind = (): void =>{
      showModal.value = true
    }
    const phoneBind = (): void =>{
      showPhoneModal.value = true
    }
    const editFormDom = (): VNode =>
      <Form layout='inline' model={formState.data} class='form_read'>
        <FormItem label='用户ID' style={{ width: '30%', marginBottom: '20px' }}> <Input v-model:value={formState.data.id} disabled /></FormItem>
        <FormItem label='手机号码' style={{ width: '30%', marginBottom: '20px' }}><Input v-model:value={formState.data.mobile} disabled /></FormItem>
        <FormItem label='姓名' style={{ width: '30%', marginBottom: '20px' }}><Input v-model:value={formState.data.name} /> </FormItem>
        <FormItem label='性别' style={{ width: '30%', marginBottom: '20px' }}>
          <RadioGroup v-model:value={formState.data.gender}>
            <Radio value='NONE'>保密</Radio>
            <Radio value='MALE'>男</Radio>
            <Radio value='FEMALE'>女</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label='头像' style={{ width: '30%' }}>
          <GUpload
            onChangeFile={changeFile}
            v-model:value={file.value} max={1}
          />
        </FormItem>
      </Form>
    const readFormDom = (): VNode =>
      <Form model={formState.data} layout='inline' class='form_read'>
        <FormItem label='用户ID' style={{ width: '30%' }}>{formState.data.id ? formState.data.id : '--'}</FormItem>
        <FormItem label='手机号' style={{ width: '30%' }}> <div> {formState.data.mobile ? formState.data.mobile : ''}{<div class='bind' onClick={phoneBind}>绑定</div>}  </div></FormItem>
        <FormItem label='微信账号' style={{ width: '30%' }}><div class='bind' onClick={bind}>绑定</div></FormItem>
        <FormItem label='姓名' style={{ width: '30%' }}>{formState.data.name ? formState.data.name : '--'}</FormItem>
        <FormItem label='性别' style={{ width: '30%' }}>
          <span class='itemContent'>
            {formState.data.gender === 'NONE' && <span>保密</span>}
            {formState.data.gender === 'MALE' && <span>男</span>}
            {formState.data.gender === 'FEMALE' && <span>女</span>}
          </span>
        </FormItem>
        <FormItem label='注册时间' style={{ width: '30%' }}>
          {formState.data?.createTime ? timeFormat(formState.data?.createTime, true) : '--'}
        </FormItem>
        <FormItem label='最后登录时间' style={{ width: '30%' }}>
          {formState.data?.lastLoginTime ? timeFormat(formState.data?.lastLoginTime, true) : '--'}
        </FormItem>
        <FormItem label='头像' style={{ width: '30%' }}>
          {imageUrl.value ? <Image src={imageUrl.value} width={100} /> : <span>--</span>}
        </FormItem>
      </Form>
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-table': (): JSX.Element => {
        return (
          <div class='detail-form'>
            {formState.loading ? <Spin fullScreen /> :
              !formState.isEdit
                ? readFormDom()
                : editFormDom()}

          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            {formState.isEdit &&
              <div>
                <Button onClick={cancel} style={{ marginRight: '10px' }}>取消</Button>
                <Button type='primary' onClick={save}>保存</Button>
              </div>}
            {!formState.isEdit && <Button type='primary' onClick={edit}>编辑</Button>}

          </>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <GLayout title='个人资料' v-slots={gLayoutSlots} >
          <Modal
            title="微信绑定"
            visible={showModal.value}
            onCancel={() =>{
              showModal.value = false
            }}
            wrapClassName="security-analysis-modal"
            centered
            footer={[
              <Button key="cancel" onClick={() =>{
                showModal.value = false
              }}>
                取消
              </Button>
            ]}
            width={380}
          >
            <div class='wx-login-container'>
            </div>
          </Modal>
          <Modal
            title="手机号绑定"
            visible={showPhoneModal.value}
            onCancel={() =>{
              showPhoneModal.value = false
            }}
            wrapClassName="security-analysis-modal"
            centered
            footer={[
              <Button key="cancel" onClick={() =>{
                showPhoneModal.value = false
              }}>
                取消
              </Button>
            ]}
            width={380}
          >
            <div class='wx-login-container'>
            </div>
          </Modal>
        </GLayout>
      </>
  }
})
