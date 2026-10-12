

// 通讯服务配置
export const COMMUNICATION_SERVICE_MAP = [
  {
    name: "讯一",
    code: "xunYi",
    key:'config',
    variable: [
      { key: 'apiKey', label: '密钥', component: 'a-textarea', componentProps: { placeholder: '请输入密钥', autoSize: true }, require: true },
      { key: 'rootAccount', label: '调度台账号', componentProps: { placeholder: '请输入调度台账号' }, require: true },
      { key: 'rootAccountPwd', label: '调度台账号密码', componentProps: { placeholder: '请输入调度台账号密码' }, require: true },
      { key: 'serverApiAddr', label: '接口服务地址', componentProps: { placeholder: '请输入接口服务地址' }, require: true },
      { key: 'isRecord', label: '是否录音',component: 'a-radio-group', componentProps: { placeholder: '请选择是否录音', options: [{ value: true, label: '是' }, { value: false, label: '否' }] }, defaultValue: true, require: true },
      { key: 'isVideo', label: '是否录像',component: 'a-radio-group', componentProps: { placeholder: '请选择是否录像', options: [{ value: true, label: '是' }, { value: false, label: '否' }] }, defaultValue: true, require: true },
      { key: 'fileUrl', label: '通讯文件地址', component: 'a-textarea', componentProps: { placeholder: '请输入通讯文件地址', autoSize: true }, require: true },
      { key: 'serverIp', label: '调度台地址', component: 'a-textarea', componentProps: { placeholder: '请输入调度台地址', autoSize: true }, require: true },
      { key: 'serverPort', label: '调度台端口', componentProps: { placeholder: '请输入调度台端口' }, require: true },
      { key: 'serverResourceUrl', label: '资源地址', component: 'a-textarea', componentProps: { placeholder: '请输入资源地址', autoSize: true }, require: true },
      { key: 'serverBusinessPort', label: '业务端口', componentProps: { placeholder: '请输入业务端口' }, require: true },
      { key: 'serverBusinessResourceUrl', label: '业务资源地址', component: 'a-textarea', componentProps: { placeholder: '请输入业务资源地址', autoSize: true }, require: true },
      { key: 'serverMobileRegisterIp', label: 'APP注册地址', component: 'a-textarea', componentProps: { placeholder: '请输入APP注册地址', autoSize: true }, require: true },
      { key: 'serverMobileRegisterPort', label: 'APP注册端口', componentProps: { placeholder: '请输入APP注册端口' }, require: true },
    ]
  },
  {
    name: '腾讯音视频',
    code: 'tencent',
    key: 'config',
    variable:[
      { key: 'securityId', label: '凭证id', componentProps: { placeholder: '请输入凭证id' }, require: true },
      { key: 'secretKey', label: '密钥', component: 'a-textarea', componentProps: { placeholder: '请输入密钥', autoSize: true }, require: true },
      { key: 'region', label: '地域信息', componentProps: { placeholder: '请输入地域信息' }, require: true },
      { key: 'sdkAppId', label: 'sdkAppId', componentProps: { placeholder: '请输入sdkAppId' }, require: true },
      { key: 'sdkAppSecretKey', label: 'sdkAppSecretKey', componentProps: { placeholder: '请输入sdkAppSecretKey' }, require: true },
    ]
  }
]