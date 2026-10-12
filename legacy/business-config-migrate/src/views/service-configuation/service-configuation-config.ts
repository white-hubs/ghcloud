import { cubeFileService } from '@/api/service'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
export const ITEM_CODE = 'SERVICE_CONFIGURATION'
export const CONFIG = [
  {
    name: "通用配置",
    code: "SERVICE_CONFIGURATION",
    variable: [
      { key: 'phone_encryption', label: '手机号加密', component: 'a-switch', require: true,defaultValue:false },
      { key: 'monitor_layout', label: '监控显示布局', component: 'a-radio-group', require: false,defaultValue:'',componentProps: {
        options:[
          {
          label:'1X1',
          value:'1X1'
         },
         {
          label:'2X2',
          value:'2X2'
         },
         {
          label:'4X4',
          value:'4X4'
         },
        ],
      }  
    },
      { key: 'monitor_thumbnail', label: '监控缩略图', component: 'g-upload', require: false,componentProps: {
        sceneCode:GLOBAL_SCENE_CODE.mData,
        file:[],
        max:1,
      },
      transferValue:async (value: any) => {
        const res=await cubeFileService.getFileInfo(value)
        return {
          propsKey:'file',
          value: [{
            uid: '',
            name: res.name ||'',
            status: 'done',
            url:res.path||'',
          }]
        }
      }
     },
    ]
  }
]