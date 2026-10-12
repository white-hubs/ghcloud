<template>
  <Modal v-model:visible="modalVisible" :confirmLoading="submitLoading" width="1200px" title="" @ok="close('ok')"
    @cancel="close('cancel')">
    <Form ref="formRef" layout="inline" :model="ruleForm" class="modal-form" :rules="rules">
      <form-item label="规则名称" name='ruleName'>
        <Input v-model:value="ruleForm.ruleName" placeholder="请输入" />
      </form-item>
      <form-item label="能耗分类" name='instrumentType'>
        <Select placeholder="请选择" style="width: 180px" v-model:value="ruleForm.instrumentType" allowClear
          :options="classifyList" :field-names="{label: 'categoryName',value: 'categoryCode' }" @change="(value,option)=>{changeClassify(value,option)}"></Select>
      </form-item>
      <form-item label="生效时间" name="effectiveTime">
        <DatePicker v-model:value="ruleForm.effectiveTime" value-format="YYYY-MM-DD" />
      </form-item>
      <form-item label="计费方式" name="complexFeeRate">
        <Select placeholder="请选择" style="width: 180px" v-model:value="ruleForm.complexFeeRate"
          :options="[{label:'单费率',value:'false'},{label:'复费率',value:'true'}]"></Select>
      </form-item>
      <form-item label="阶梯用量" name="stairsEnergyType">
        <Select v-model:value="ruleForm.stairsEnergyType" placeholder="请选择"
          :options="[{label:'无',value:'NOTHING'},{label:'按月',value:'MONTH'},{label:'按年',value:'YEARS'}]">
        </Select>
      </form-item>
    </Form>
    <div>
      <p style="float: right;color:var(--cube-theme-var--primary-color);cursor: pointer;" @click="addRule">添加阶梯</p>
      <div class="table" v-for="(item,index) in stairsEnergyContentsList">
        <div class="table-head">
          <p>
            <div v-if="ruleForm.stairsEnergyType!=='NOTHING'" style="display: inline-block;margin-left: 10px;">
              <span>阶梯：</span><span>{{ index===0?0:stairsEnergyContentsList[index-1].endEnergy }}</span>
              <span>{{ `<用量\≤` }}</span>
              <InputNumber :value="item.endEnergy" @change="(value)=>{
                const table=JSON.parse(JSON.stringify([stairsEnergyContentsList[index]]))
                table[0].endEnergy=value
                stairsEnergyContentsList[index]=table[0]
                }" 
                max="9999999999"
                min="0"
                style="width: 100px" 
                placeholder="请输入"
              />
            </div>
            <div v-if="ruleForm.complexFeeRate==='false'" style="display: inline-block;margin-left: 10px;">
              <span>单价：</span>
              <InputNumber type='number' :value="item.price" @change="(value)=>{
                const table=JSON.parse(JSON.stringify([stairsEnergyContentsList[index]]))
                table[0].price=value
                stairsEnergyContentsList[index]=table[0]
                }" 
                max="9999999999"
                min="0"
                style="width: 100px" 
                placeholder="请输入"
              />
            </div>
          </p>
          <p v-if="stairsEnergyContentsList.length>1" style="float: right;color:var(--cube-theme-var--primary-color);cursor: pointer;"
            @click="removeRule(index)">移除</p>
          
        </div>
        <Table v-if="ruleForm.complexFeeRate==='true'" :columns="ruleColumns" :data-source="[stairsEnergyContentsList[index]]" :rowKey="'code'"
          :pagination="false">
          <template #fvPrice>
            <InputNumber 
              :value="item.fvPrice" @change="(value)=>{
              const table=JSON.parse(JSON.stringify([stairsEnergyContentsList[index]]))
              table[0].fvPrice=value
              stairsEnergyContentsList[index]=table[0]
              }"
              max="9999999999"
              min="0"
            />
          </template>
          <template #pvPrice>
            <InputNumber 
              :value="item.pvPrice" 
              @change="(value)=>{
                const table=JSON.parse(JSON.stringify([stairsEnergyContentsList[index]]))
                table[0].pvPrice=value
                stairsEnergyContentsList[index]=table[0]
                }"
              max="9999999999"
              min="0"
            />
          </template>
          <template #jvPrice>
            <InputNumber 
              :value="item.jvPrice" 
              @change="(value)=>{
                const table=JSON.parse(JSON.stringify([stairsEnergyContentsList[index]]))
                table[0].jvPrice=value
                stairsEnergyContentsList[index]=table[0]
              }"
             max="9999999999"
             min="0"
            />
          </template>
          <template #gvPrice>
            <InputNumber 
              :value="item.gvPrice" 
              @change="(value)=>{
                const table=JSON.parse(JSON.stringify([stairsEnergyContentsList[index]]))
                table[0].gvPrice=value
                stairsEnergyContentsList[index]=table[0]
              }"
              max="9999999999"
              min="0"
            />
          </template>
        </Table>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import {ref,reactive,watch} from "vue";
import {  Modal } from "ant-design-vue/es";
import { onMounted } from 'vue'
import { EnergyCollectConfigList, EnergyCollectPeriodItype } from '@/api/energyOverview'
import { Input, message, type TableColumnsType } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/lib/form'
import dayjs from 'dayjs'
import { addEnergyChargeRules, editEnergyChargeRules } from '@/api/feeManage'
import type { DefaultOptionType, SelectValue } from 'ant-design-vue/es/select'

interface Props {
  visible?: boolean;
  data:any
}
interface RuleItem{
    stairs: number;
    startEnergy: number;
    endEnergy: number;
    price: number;
    fv: string;
    fvPrice: number;
    pv: string;
    pvPrice: number;
    gv: string;
    gvPrice: number;
    jv: string;
    jvPrice: number;
}
const props = withDefaults(defineProps<Props>(), {
  visible:false,
});
const emit = defineEmits(['close'])
const modalVisible=ref(false)
const submitLoading=ref(false)
const ruleForm = reactive({
  ruleName:'',
  instrumentType:'',
  instrumentTypeName:'',
  effectiveTime:'',
  complexFeeRate:'false',
  stairsEnergyType:'NOTHING'
});
const formRef=ref()
const rules: Record<string, Rule[]> = {
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' },],
  instrumentType: [{ required: true, message: '请选择能耗分类', trigger: 'change' }],
  effectiveTime: [{ required: true, message: '请选择生效时间', trigger: 'blur' }],
  complexFeeRate:  [{ required: true, message: '请选择计费方式', trigger: 'change' }],
  stairsEnergyType: [{ required: true, message: '请选择阶梯用量', trigger: 'change' }],
};
const classifyList=ref()
const stairsEnergyContentsList=ref<RuleItem[]>([])
let ruleItem:RuleItem
const getData=async()=>{
  const res=await EnergyCollectPeriodItype('default')
  ruleItem={
    stairs:1,
    startEnergy:0,
    endEnergy:0,
    price:0,
    fv:res.data.filter((x: { code: string })=>x.code==='FV').map((x: { startTime: string; endTime: string })=>`${x.startTime}-${x.endTime}`).join(','),
    fvPrice:0,
    pv:res.data.filter((x: { code: string })=>x.code==='PV').map((x: { startTime: string; endTime: string })=>`${x.startTime}-${x.endTime}`).join(','),
    pvPrice:0,
    gv:res.data.filter((x: { code: string })=>x.code==='GV').map((x: { startTime: string; endTime: string })=>`${x.startTime}-${x.endTime}`).join(','),
    gvPrice:0,
    jv:res.data.filter((x: { code: string })=>x.code==='JV').map((x: { startTime: string; endTime: string })=>`${x.startTime}-${x.endTime}`).join(','),
    jvPrice:0
  }
  if(props.data){
    //编辑
    ruleForm.ruleName=props.data.ruleName
    ruleForm.instrumentTypeName=props.data.instrumentTypeName
    ruleForm.instrumentType=props.data.instrumentType
    ruleForm.effectiveTime=dayjs(props.data.effectiveTime).format('YYYY-MM-DD')
    ruleForm.complexFeeRate=props.data.complexFeeRate?'true':'false'
    ruleForm.stairsEnergyType=props.data.stairsEnergyType
    stairsEnergyContentsList.value=JSON.parse(props.data.stairsEnergyContents)
  }else{
    //新增
    stairsEnergyContentsList.value.push(ruleItem)
  }
  const { data }=await EnergyCollectConfigList()
  classifyList.value =data;
}
onMounted(()=>{
  getData()
})
const ruleColumns: TableColumnsType =[
  {
    title: "峰时段",
    dataIndex: "fv",
    key: "fv",
    width:160,
    align:'left',
    customRender: ({ text }: { text: string }) => {
      return text as string || '--' 
    },
  },
  {
    title: "峰单价",
    dataIndex: "fvPrice",
    key: "fvPrice",
    align:'center',
    slots: { customRender: 'fvPrice' },
  },
  {
    title: "谷时段",
    dataIndex: "gv",
    key: "gv",
    width:160,
    align:'center',
    customRender: ({ text }: { text: string }) => {
      return text as string || '--' 
    },
  },
  {
    title: "谷单价",
    dataIndex: "gvPrice",
    key: "gvPrice",
    align:'center',
    slots: { customRender: 'gvPrice' },
  },
  {
    title: "平时段",
    dataIndex: "pv",
    key: "pv",
    width:160,
    align:'center',
    customRender: ({ text }: { text: string }) => {
      return text as string || '--' 
    },
  },
  {
    title: "平单价",
    dataIndex: "pvPrice",
    key: "pvPrice",
    align:'center',
    slots: { customRender: 'pvPrice' },
  },
  {
    title: "尖时段",
    dataIndex: "jv",
    key: "jv",
    ellipsis: true,
    align:'center',
    customRender: ({ text }: { text: string }) => {
      return text as string || '--' 
    },
  },
  {
    title: "尖单价",
    dataIndex: "jvPrice",
    key: "jvPrice",
    ellipsis: true,
    align:'center',
    slots: { customRender: 'jvPrice' },
  },
]
const addRule=()=>{
  stairsEnergyContentsList.value.push(ruleItem)
}
const removeRule=(index:number)=>{
  stairsEnergyContentsList.value.splice(index,1)
}
const changeClassify=(_value:SelectValue,option:DefaultOptionType)=>{
  ruleForm.instrumentTypeName=option.categoryName
}
watch(()=>props.visible,()=>{
  modalVisible.value=props.visible
},{immediate:true,deep:true})
const close=(type?:string)=>{
  if(type==='ok'){
    formRef.value.validate().then(async()=>{
      submitLoading.value=true
      stairsEnergyContentsList.value.forEach((_x,i)=>{
        if(i!==0){
          stairsEnergyContentsList.value[i].startEnergy=stairsEnergyContentsList.value[i-1].endEnergy
        }
      })
      const params={
        ...ruleForm,
        complexFeeRate:ruleForm.complexFeeRate==='true',
        stairsEnergyContentsList:stairsEnergyContentsList.value,
        stairsEnergyContents:JSON.stringify(stairsEnergyContentsList.value)
      }
      try{
        props.data?await editEnergyChargeRules({id:props.data.id,...params}):await addEnergyChargeRules(params)
        message.success("新增成功");
        submitLoading.value=false
        modalVisible.value=false
        emit('close')
      }catch(err){
        submitLoading.value=false
      }
    })
  }else{
    emit('close')
    modalVisible.value=false
  }
}
</script>
<style lang="scss">
.modal-form>div {
  margin: 10px;
  width: 300px;
}

.table {
  width: 100%;

  .table-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
