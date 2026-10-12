<template>
  <div id="printFrom">
    <div class="box-outer box">
      <div class="head">{{ flowForm.name }}</div>
    </div>
    <table>
      <thead>
        <div style="margin-top: 50px;"></div>
      </thead>
      <!-- 联系方式 -->
      <tr v-if="currentTaskDetail?.processInstanceRunningInfo?.outSider">
        <td>联系方式</td>
        <td style="text-align: left;">
          <div>姓名：{{ currentTaskDetail?.processInstanceRunningInfo?.startName.split(':')[0] }} </div>
          <div>电话：{{ currentTaskDetail?.processInstanceRunningInfo?.startName.split(':')[1] }}</div>
        </td>
      </tr>
      <!-- <tr v-else>
        <td style="width: 100px;">联系人</td>
        <td>
          <div style="width:500px;white-space:normal;word-wrap:break-word;word-break:break-all;">{{
            currentTaskDetail?.processInstanceRunningInfo?.startName }}</div>
        </td>
      </tr> -->
      <!-- 表单 -->
      <template v-for="item in formOptions" :key="item.id">
        <template v-if="getPermission(item).show">
          <tr v-if="item.name === 'Description'">
            <td colspan="2" style="text-align: left;">{{ item.value }}</td>
          </tr>
          <tr v-else-if="item.name === 'ChooseAssetTable'">
            <td style="padding: 0;" colspan="2">
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 10px ;" v-for="chooseAsset in columnsChooseAsset">{{ chooseAsset.title }}</td>
                </tr>
                <tr v-for="chooseAsset_item in item.value">
                  <td style="padding: 10px;" v-for="chooseAsset_value in chooseAsset_item">{{ chooseAsset_value }}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr v-else-if="item.name === 'AddAssetTable'">
            <td style="padding: 0;" colspan="2">
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 10px ;" v-for="chooseAsset in columnsAddAsset">{{ chooseAsset.title }}</td>
                </tr>
                <tr v-for="chooseAsset_item in item.value">
                  <td style="padding: 10px;" v-for="chooseAsset_value in chooseAsset_item">{{ chooseAsset_value }}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr v-else-if="item.name === 'ConsumablesEnter'">
            <td style="padding: 0;" colspan="2">
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 10px ;" v-for="Consumables in columnsConsumables">{{ Consumables.title }}</td>
                </tr>
                <tr v-for="Consumables_item in item.value">
                  <td style="padding: 10px;" v-for="Consumables_value in Consumables_item">{{ Consumables_value }}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr v-else-if="item.name === 'AddAssetTable'">
            <td style="padding: 0;" colspan="2">
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 10px ;" v-for="chooseAsset in columnsAddAsset">{{ chooseAsset.title }}</td>
                </tr>
                <tr v-for="chooseAsset_item in item.value">
                  <td style="padding: 10px;" v-for="chooseAsset_value in chooseAsset_item">{{ chooseAsset_value }}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr v-else-if="item.name === 'ConsumablesOut'">
            <td style="padding: 0;" colspan="2">
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 10px ;" v-for="chooseAsset in columnsOut">{{ chooseAsset.title }}</td>
                </tr>
                <tr v-for="chooseAsset_item in item.value">
                  <td style="padding: 10px;" v-for="chooseAsset_value in chooseAsset_item">{{ chooseAsset_value }}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr v-else>
            <td style="width: 100px;">{{ item.title }}</td>
            <td>
              <div style="width:500px;white-space:normal;word-wrap:break-word;word-break:break-all;">{{ item.value}}
              </div>
            </td>
          </tr>
        </template>
      </template>
      <!-- 流程节点 -->
      <template v-for="(item,index) in flowPathNode" :key="item.nodeKey">
        <tr v-for="(data,i) in item.taskOperations" :key="data.operation.sign+i">
          <td :rowspan="item.taskOperations.length" v-if="i==0">{{ item.nodeName }}</td>
          <td>
            <!-- 会签 -->
            <div class="countersign"
              v-if="data.operation.approvalOpinion.approvalType =='ARTIFICIAL' || flowForm.autoApprovalPrinting">
              <div>
                {{ data.operation.operator.name }} {{ data.operation.typeAlias??'同意' }}
              </div>
              <div style="width: 480px; word-wrap: break-word;" v-if="item.approvalCommentConfig?.supportText">
                审批意见：{{ data.operation.approvalOpinion.text || '已同意' }}
              </div>
              <div v-if="item.approvalCommentConfig?.supportHandwrittenSignature&&data.operation.approvalOpinion.sign"
                class="signPic-box">
                <span> 电子签名:</span>
                <div class="imgClass">
                  <SignPic style="width: 60px;" :sign-id="data.operation.approvalOpinion.sign" />
                </div>
              </div>
            </div>
            <div class="countersign">
              时间：{{ data.operation.createTime?dayjs(data.operation.createTime).format('YYYY-MM-DD HH:mm:ss'):'--' }}
            </div>
          </td>
        </tr>
      </template>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject,Ref, computed, ComputedRef, nextTick} from 'vue'
import { CurrentTaskDetail, FlowForm } from "@/domain/form-flow";
import { ProcessType ,ProcessRoute} from "@/typings/process";
import Printjs from "print-js";
import { getNode } from "../units";
import { useRoute } from "vue-router"
import { printNode } from "@/api/flow";
import SignPic from "./SignPic.vue";
import dayjs from 'dayjs'
import eventBus from "@/utils/event-bus";
import { columnsConsumables,columnsChooseAsset,columnsAddAsset ,columnsOut} from "./printPage";
type formOption = {value:string; id: string, title: string, width?: number, props: any, name: string,showPrint:boolean }
const processType = inject("processType");
const businessType = inject("businessType");
const flowForm = inject("flowForm") as Ref<FlowForm>;
const formOptions = ref<any[]>([]); //表单配置
const initFormOptions = ref<any[]>([]); //表单配置
const currentTaskDetail = inject("currentTaskDetail") as Ref<CurrentTaskDetail>;
const processId = inject("processId") as string;
const currentUser = inject("currentUser") as Ref;
const flowPathNode = ref<any>([])
const formData = ref<any>({}); //表单数据
const {
  query: { title },
} = useRoute() as ProcessRoute;
const workOvertimeOptions = ref<any>({
  'WORK':'工作日',
  'REST':'休息日',
  'FESTIVAL':'节假日',
});
const ObjectTypeSelectOptions:any = {
  'DEVICE':'设备',
  'STALL':'档位',
  'PROPERTY':'资产',
  'SITE_POINT':'现场点',
  'SMALL_ENGINEERING':'小散工程'
}
const style = `
@page{size:auto; 
  margin: 0;
  margin-bottom: 2cm;
}
.box {
    box-sizing: border-box;
  }

  .box-outer {
    width: 100%;
    min-height:60px;
  }

  .head {
    font-size: 32px;
    font-weight: bold;
    text-align: center;
    margin: 30px auto;
    margin-bottom: 0;
  }
	.head_sub{
		margin: 0 40px 20px ;
	}

	.head_info{
		border: 1px solid black;
		margin: 40px auto;
		width: 90%;
		padding: 20px 20px 10px;
	}
	.head_info_desc{
		margin: 10px 0;
	}
	.head_info_foot{
		text-align: right;
		margin-bottom: 10px;
		
	}
  .countersign {
    text-align: left;

    .signPic-box {
      text-align: right;
    }
    .imgClass{
      width:100px;
      min-height: 50px;
      max-height: 50px;
      display: inline-block;
    }
  }
	table {
		width: 90%;
		font-size: 14px;
    margin: auto;
	}
	td,
	th {
		text-align: center;
		border: 0.5px solid #000;
		border-collapse: collapse;
	}
  table{
    border-collapse: collapse;
  }
  tr {
        page-break-inside: avoid;
      }
	table td {
		padding: 4px 10px;
	}
`;

//当前表单权限 只读 可编辑 隐藏
enum FormItemPermission {
  READONLY = 'R',
  EDIT = 'E',
  HIDE = 'H'
}
interface FormPerms {
  id: string,
  perm: FormItemPermission,
  required: boolean,
  title: string
}
const formPerms: ComputedRef<FormPerms[]> = computed(() => {
  if (flowForm.value && nodeId.value) {
    let nowNode = getNode(JSON.parse(processType === ProcessType.DETAIL ? currentTaskDetail.value.properties.processJson : flowForm.value.flowJson), nodeId.value)
    return nowNode ? nowNode.props.formPerms : []
  }
  return []
})
//当前所处于的结点
const nodeId = computed(() => {
  if (processType === ProcessType.ADD) {
    return 'root'
  } else {
    return currentTaskDetail.value.key
  }
})
const getPermission = (item: formOption): { show: boolean; readonly: boolean; } => {
  const res = {
    show: false,
    readonly: false,
  }
  // 是否展示打印节点
  if (item.name === 'ConsumablesOut'|| item.name ==='Description'||item.name ==='ChooseAssetTable'||item.name ==='AddAssetTable'||item.name === 'ConsumablesEnter') {
    res.show = true
  }else if (!item.props.showPrint) {
    res.show = false
    res.readonly = true
    return res
  }
  //流程结束情况 全部显示 全部只读
  if (nodeId.value === '') {
    res.show = true
    res.readonly = true
    return res
  }
  const findIndex = formPerms.value.findIndex(e => e.id === item.id)

  //如果没有获取到权限数据的情况
  if (formPerms.value.length === 0 || findIndex === -1) {
    res.show = true
    res.readonly = processType === ProcessType.DETAIL
    return res
  }

  res.show = formPerms.value[findIndex].perm !== FormItemPermission.HIDE
  res.readonly = formPerms.value[findIndex].perm === FormItemPermission.READONLY
  return res
}
// 获取打印节点
const getPrintNode =async ()=>{
  if (processId) {
    let res = await printNode({ processInstanceId: processId })
    flowPathNode.value = res
  }
}
const handleFormOptions=()=>{
  formOptions.value=initFormOptions.value.filter(item=>{
    if(getParamsHandler(item)){
      return item
    }
  })
}
const getParamsHandler=(item:formOption):boolean=>{

  if(processType===ProcessType.ADD){
    return true
  }
  //不为外部表单，不展示外部人员联系方式
  if(item.name==='OutsiderConcat'){
    return currentTaskDetail.value.processInstanceRunningInfo?.outSider?true:false
  }
  //只读并且没有值，不展示
  const data = expandData(JSON.parse(currentTaskDetail.value.data),true)
  
  if(getPermission(item).readonly){
    return data[item.id]?true:false
  }

  //驳回和撤销使用上个节点的展示状态
  const status=currentTaskDetail.value.processInstanceRunningInfo.status
  const formPerms=currentTaskDetail.value.processInstanceRunningInfo.formPerms as {perm:string;id:string}[]
  if(['REJECT','UNDO'].includes(status)){
    const perm=formPerms.find((x:{id:string})=>x.id===item.id)?.perm
    return perm==='H'?false:true
  }

  if(!item.props.relateParams) return true
  if(typeof item.props.relateParams !== 'object'){
    return true
  }
  const key = Object.keys(item.props.relateParams)[0];
  const value = Object.values(item.props.relateParams)[0]
  const comItem = initFormOptions.value.find(item=>item.id===key)
  if(!comItem) return true
  if(!['SelectInput','MultipleSelect','VacationType'].includes(comItem.name) ){
    return true
  }
  const paramsValue = formData.value[key]
  
  if(!paramsValue) return false
  if(typeof paramsValue==='string'){
    return paramsValue  ===  value
  }
  if(Array.isArray(paramsValue)){
    return paramsValue.includes(value)
  }
  if(typeof paramsValue === 'object'){
    return paramsValue.id===value
  }
  return false
}
// 处理组合容器，把对象里面的数组拿出来平铺
const expandData = (data: { [x: string]: any },display:boolean)=>{
  const arrayFieldKey = Object.keys(data).find(key => Array.isArray(data[key]));
  
  if (arrayFieldKey) {
      const arrayField = data[arrayFieldKey];
      arrayField.forEach((item: { [x: string]: any },index: any) => {
          Object.keys(item).forEach(key => {
              data[`${arrayFieldKey}_${index}_${key}`] = item[key];
          });
      });
      if (!display) {
        delete data[arrayFieldKey];
      }
  }
  return data
}
//打印相关
const print = () => {
  // showPrintNode.value = true;
  nextTick(() => {
    Printjs({
      printable: "printFrom", // 要打印内容的id
      type: "html",
      targetStyles: ["*"],
      style: style, // 打印的内容是没有css样式的，此处需要string类型的css样式
      // style: `@page{size:auto;margin: 0cm;}`, // 打印的内容是没有css样式的，此处需要string类型的css样式
      scanStyles: false,
      // onLoadingEnd() {
      // 	showPrintNode.value = false;
      // },
    });
  });
};
// 单独处理组合容器
const setGroupListData = ()=>{
  if(!currentTaskDetail.value) return
  const compositionContainer = expandData(JSON.parse(currentTaskDetail.value.data),false)
   initFormOptions.value.forEach((e:any,index) => {
     e.value = formData.value[e.id]
      if (e.name === 'GroupList') {
        const arr:any = []
        formData.value[e.id].forEach((combination:any,index:number)=>{
         const arrItem = JSON.parse(JSON.stringify(e.props.items))
          arrItem.forEach((item:any)=>{
            e.value?.forEach((data:any)=>{
              if (!item.id.includes('_')) {
                item.id = `${e.id}_${index}_`+JSON.parse(JSON.stringify(item.id))
              }
              item.value = compositionContainer[item.id]
            })
          })
          arr.push(arrItem)
        })
        initFormOptions.value.splice(index, 1);
        initFormOptions.value.splice(index,0, ...arr.flat(1)) 
      }
    })
}


defineExpose({
  print,
});

// 监听渲染端formData数据改变
const handleListenRenderFormData=()=>{
  eventBus.on('formRenderDataChange',(data:any)=>{
    formData.value = data
    handleFormOptions()
  })
}
// 处理新增的人事业务组件打印
const handlePersonnelComponents=(e:any)=>{
  const PersonnelComponentHandle:Record<string,any>={
    PersonnelCategory:(e:any)=>{
      e.value=e.value.label
    },
    ServicePeriod:(e:any)=>{
      if(e.value.radioValue==='limited'){
        e.value=`服务期限至${e.value.date}`
      }else{
        e.value='无期限'
      }
    },
    AccessPermission:(e:any)=>{
      if(e.value.accessControl){
        const accessControlDeviceNames=e.value.accessControlRows.map((item:any)=>item.name).join(',')
        e.value=`${accessControlDeviceNames}开启门禁权限`
      }else{
        e.value='未开启门禁权限'
      }
    },
    SwitchSelect:(e:any)=>{
      if(e.value){
        e.value='开启'
      }else{
        e.value='关闭'
      }
    },
    ParkingPermission:(e:any)=>{
      if(e.value.parkingControl){
        const parkingControlDeviceNames=e.value.parkingControlRows.map((item:any)=>item.deviceName).join(',')
        e.value=`${parkingControlDeviceNames}开启停车权限`
      }else{
        e.value='未开启停车权限'
      }
    }
  }
  if(PersonnelComponentHandle[e.name]){
    PersonnelComponentHandle[e.name](e)
  }
}
onMounted(async () => {
  const formJson = processType === ProcessType.ADD ? flowForm.value.formJson : currentTaskDetail.value?.properties.formJson
  initFormOptions.value = JSON.parse(formJson); //表单配置

  if (processType === ProcessType.DETAIL) {
    formData.value = JSON.parse(currentTaskDetail.value.data);
    setGroupListData()
    // 处理表单数据格式
    initFormOptions.value.forEach(async(e:any) => {  
      if (e.value) {
        handlePersonnelComponents(e)
        if (e.name==='VacationLength') {
          e.value = e.value +'小时'
        }else if(e.name==='ObjectTypeSelect'){
          e.value = ObjectTypeSelectOptions[e.value]
        }else if (e.name === 'OvertimeType') {
          e.value = workOvertimeOptions.value[e.value]
        } else if (e.name === 'AssetIsExpired') {
          e.value ? e.value='是':e.value='否'
        }else if (e.name=="ChooseAssetTable") {
          e.value  =  e.value.map((e:any,index:number)=>{
            return {
              key:index+1,
              serialNumber:e.serialNumber,
              name:e.name,
              typeName:e.typeName,
              adminName:e.adminName,
              purchaseDate:dayjs(e.purchaseDate).format('YYYY-MM-DD'),
              price:e.price,
              norms:e.norms,
              unit:e.unit,
              number:e.number,
            }
          })
        }else if (e.name=="AddAssetTable") {
          e.value  =  e.value.map((e:any,index:number)=>{
            return {
              key:index+1,
              serialNumber:e.serialNumber,
              name:e.name,
              typeId:e.type.name,
              purchaseDate:dayjs(e.purchaseDate).format('YYYY-MM-DD'),
              maintenanceTime:e.maintenanceTime,
              usageTime:e.usageTime,
              norms:e.norms,
              unit:e.unit,
              number:e.number,
              price:e.price,
              adminId:e.adminId,
              areaIds:e.areaIds,
            }
          })
        }else if (e.name === "ConsumablesEnter") {
          e.value = e.value.map((e: any,index: number)=>{
            return {
              key:index+1,
              name:e.name,
              code:e.code,
              model:e.model,
              brand:e.brand,
              categoryName:e.categoryName,
              unit:e.unit,
              stock:e.stock,
              price:e.price,
              num:e.num,
              storeAmount:e.storeAmount,
            }
          })
        }else if (e.name === "ConsumablesOut") {
          e.value = e.value.map((e: any,index: number)=>{
            return {
              key:index+1,
              name:e.name,
              code:e.code,
              model:e.model,
              brand:e.brand,
              categoryName:e.categoryName,
              unit:e.unit,
              avgPrice:e.avgPrice,
              storeNum:e.storeNum,
              useLimit:e.useLimit,
              ConsumablesOutNumInput:e.num,
              AmountInputForConsumable:e.storeAmount,
            }
          })
        } else if (e.name==="DateTimeRange"||e.name==='VacationDate') {
          e.value = e.value.join('~')
          e.value=  e.value.replace(/AM/g, "上午");
          e.value=  e.value.replace(/PM/g, "下午");
        } else if (e.name==='VacationBalance') {
          e.value = e.value === 'NO_LIMITED' ? '不限制': e.value
        }  else if (e.name==='DepartureTimeLength') {
          e.value = e.value?e.value+'小时':''
        } else if (e.name === 'Description') {
          e.value = e.props.placeholder
        }else if (e.value?.constructor === Object) {
          e.value = e.value.name
        }else if (e.value instanceof Array&&e.name!=="ChooseAssetTable") {
          if (typeof e.value[0]=== 'string') {
            e.value = e.value.join()
          }else if (e.value&&e.value.toString()==='') {
          e.value=''
        }else{
            let dataArr = e.value.map((item:any)=>{
              return item.name
            })
            e.value = dataArr.join()
          }
        }
      }else {
        if (e.name === 'AssetIsExpired' && e.value === false) {
          e.value='否'
        }else if (e.name === 'Description') {
           e.value = e.props.placeholder
        } else{
          e.value=''
        }
      }
    })
  } else {
    setGroupListData()
    initFormOptions.value.forEach(e => {
      e.value = formData.value[e.id]
      if (e.name ==='Description') {
        e.value = e.props.placeholder
      }else{
        e.value = ''
      }
    })
  }
  
  handleFormOptions()
  handleListenRenderFormData()
  
  await getPrintNode()
})
</script>
<style scoped lang="less">
#printFrom {
  .box {
    box-sizing: border-box;
  }

  .box-outer {
    width: 100%;
    min-height: 60px;
  }

  .head {
    font-size: 32px;
    font-weight: bold;
    text-align: center;
    margin: 30px auto;
    margin-bottom: 0;
  }

  .countersign {
    text-align: left;

    .signPic-box {
      text-align: right;
    }

    .imgClass {
      width: 100px;
      min-height: 50px;
      max-height: 50px;
      display: inline-block;
    }
  }

  table {
    width: 90%;
    font-size: 14px;
    margin: auto;
  }

  td,
  th {
    text-align: center;
    border: 1px solid #000;
    // border-collapse: collapse;
  }

  table td {
    padding: 4px 10px;
  }
}
</style>