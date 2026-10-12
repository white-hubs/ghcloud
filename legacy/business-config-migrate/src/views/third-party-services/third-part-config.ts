import { COMMUNICATION_SERVICE_MAP } from './ form-item-config'
import { useFormConfig } from './use-form-config'
const { handleChange } = useFormConfig()

export const ITEM_CODE = 'THIRD_SERVICE'
export const THIRD_PART_CONFIG = [
  {
    name: "高德地图服务",
    code: "gdMap",
    variable: [
      { key: 'andriodKey', label: '安卓-key', componentProps: { placeholder: '请输入安卓-Key' }, require: true },
      { key: 'iosKey', label: 'IOS-Key', componentProps: { placeholder: '请输入IOS-key' }, require: true },
      { key: 'webKey', label: 'WEB-Key', componentProps: { placeholder: '请输入WEB-key', }, require: true },
      { key: 'securityJsCode', label: 'WEB安全码', componentProps: { placeholder: '请输入WEB安全码', }, require: false },
    ]
  },
  {
    name: "天地图服务",
    code: "TD_MAP",
    variable: [
      { key: 'webKey', label: '天地图web-key', componentProps: { placeholder: '请输入WEB-key', }, require: true },
    ]
  },
  {
    name: "通讯服务",
    code: "THIRD_SERVICE::correspond_service",
    variable: [
      { key: 'providerCode', label: '服务提供商', component: 'a-select',
        componentProps: { 
          placeholder: '请选择服务提供商',
          options: [ { value: 'xunYi', label: '讯一' },{ value: 'tencent', label: '腾讯' }],
          allowClear: true,
          onChange: (value: string) => {
            handleChange({ key: 'providerCode', value: value, formSourceMap: COMMUNICATION_SERVICE_MAP })
          },
          defaultFormSourceMap: COMMUNICATION_SERVICE_MAP
        }, 
        require: true
      },
    ]
  },
  {
    name: "人脸识别",
    code: "att_identity_verify",
    variable: [
      { key: 'deviceType', label: '接入类型', require: true, component: 'a-radio-group', componentProps: { placeholder: '请输入设备类型', options: [{ value: 'ALIYUN', label: '阿里' }] }, defaultValue: '1' },
      { key: 'confidence', label: '相识度', require: true, component: 'a-input-number', componentProps: { min: 75, max: 100, precision: 2, placeholder: '请输入相识度(数字)', } },
      { key: 'accessKeyId', label: 'accessKeyId', componentProps: { placeholder: '请输入accessKeyId' }, require: true },
      { key: 'accessKeySecret', label: 'accessKeySecret', componentProps: { placeholder: '请输入accessKeySecret' }, require: true },
      { key: 'endpoint', label: '服务地址', componentProps: { placeholder: '请输入服务地址' }, require: true },
    ]
  },
  {
    name: "微信公众号",
    code: "WX_OFFICIAL_ACCOUNT",
    variable: [
      { key: 'name', label: '公众号名称', componentProps: { placeholder: '请输入公众号名称' }, require: true },
      { key: 'appid', label: 'appid', componentProps: { placeholder: '请输入公众号appid' }, require: true },
      { key: 'secret', label: 'secret', componentProps: { placeholder: '请输入公众号secret', }, require: true },
    ]
  }
]
