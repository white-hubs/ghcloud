<template>
  <g-layout title="业务权限">
    <template #content-table>
      <permission-table title="门禁" type="accessControl" :columns="accessControlColumns" v-model:dataSource="accessControlData" />
      <permission-table title="停车" type="parking" :columns="parkingColumns" v-model:dataSource="parkingData" />
      <div class="consumption">
      <div class="title">消费权限</div>
      <a-switch v-model:checked="consumption"></a-switch>
    </div>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <a-button type="primary" @click="saveRecord" :loading="isLoading">保存</a-button>
    </template>
  </g-layout>
</template>
<script>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  onMounted,
} from "vue";
import _ from "lodash";
import gLayout from "@/components/common/gLayout.vue";
import { message } from "ant-design-vue"
import PermissionTable from './permission-table.vue'
import { authStore } from '@/api/auth-store'
import {CubeThirdPartyService} from '@/api/third-party-service'
import {useRoute,useRouter} from 'vue-router'
export default defineComponent({
  components: { gLayout, PermissionTable },
  name: "business-permissions",
  setup() {
    const state = reactive({ 
      isLoading: false,
      consumption:true,
      accessControlData:[],
      parkingData:[]
     });
    const route=useRoute()
    const router=useRouter()
    onMounted(async()=>{
      try{
        const {consumePm,doorDeviceList,parkingInfos}=await cubeThirdPartyService.getUserPermissionMobile(route.query.mobile)
        state.consumption=consumePm
        state.accessControlData=doorDeviceList
        state.parkingData=parkingInfos
      }catch(err){}
    })
    const cubeThirdPartyService= new CubeThirdPartyService(authStore)
    
    /*保存数据*/
    const saveRecord = async () => {
      try {
        state.isLoading = true;
        await cubeThirdPartyService.updateUserPermissionMobile({
          mobile:route.query.mobile,
          consumePm: state.consumption,
          parkingInfos: state.parkingData,
          doorDeviceList: state.accessControlData,
        })
        message.success("操作成功");
        state.isLoading = false;
        goBack();

      } catch (error) {
        state.isLoading = false;
      } finally {
        state.isLoading = false;
      }
    };
    /* 返回 */
    const goBack = () => {
      router.replace({ path: '/roster' })

    };
    const accessControlColumns = [
      {
        title: "序号",
        dataIndex: "row",
        key: "row",
        width: 80,
        customRender: ({ text,index }) => {
          return index+1;
        } 
      },
      {
        title: "设备编码",
        dataIndex: "doorCode",
        key: "doorCode",
      },
      {
        title: "设备名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "门禁类型",
        dataIndex: "typeName",
        key: "typeName",
      },
      {
        title: "所属区域",
        dataIndex: "areaName",
        key: "areaName",
        customRender: ({ text }) => {
          return text || "--";
        } 
      },
      {
        title: "操作",
        dataIndex: "operate",
        key: "operate",
        width:'100px',
        slots: { customRender: 'operate' }
      },
    ]
    const parkingColumns = [
      {
        title: "序号",
        dataIndex: "row",
        key: "row",
        width: 80,
        customRender: ({ text,index }) => {
          return index+1;
        } 
      },
      {
        title: "停车场编码",
        dataIndex: "code",
        key: "code",
      },
      {
        title: "停车场名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "操作",
        dataIndex: "operate",
        key: "operate",
        width:'100px',
        slots: { customRender: 'operate' }
      },
    ]
   
    return {
      ...toRefs(state),
      goBack,
      saveRecord,
      parkingColumns,
      accessControlColumns,
    };
  },
});
</script>
<style lang="less" scoped>
.consumption {
  display: flex;

  margin-bottom: 10px;

  .title {
    font-size: 15px;
    font-weight: 500;
    margin-right: 10px;
  }
}
</style>