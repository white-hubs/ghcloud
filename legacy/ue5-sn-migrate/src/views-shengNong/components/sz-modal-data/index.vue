<template>
  <div class="modal-wrap" id="sz-modal-data">
    <!-- <div class="top">下级市场</div> -->
    <div :class="['market-list', piniaStoreArea.marketDataSZ?.length > 6 ? 'grid-3' : 'grid-2']">
      <div :class="['market-item', item?.version?.includes('1.0') && 'market-item-green']" :id="`sz-market-${item.marketTenant}-${item.marketName}`"
        v-for="item in piniaStoreArea.marketDataSZ" :key="item.id">
        {{item.name}}
        <!-- <div v-if="item?.version?.includes('1.0')" class="version-wrap">
          <span class="version">1.0</span>
        </div> -->
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, } from "vue";
import { storeArea } from "@/piniaStore/area";
import { message } from "ant-design-vue";
import { getMarketConfig } from "@/api/shennong/alarm";
import { storeMenu } from "@/piniaStore/menu";
const piniaStoreMenu = storeMenu();
import axios from "axios";
import qs from 'qs'
const emits = defineEmits(['removeSZLabel'])
const piniaStoreArea = storeArea();
const handleGoMarket=(item)=>{
  hrefToSubMarket(item.marketTenant)
}
// todo: 暂时处理点击事件无法直接绑定的问题，后续优化
window.addEventListener("mousedown", (event) => {
  if(event.target.id.includes('sz-market')){
      const marketTenant=event.target.id.split('-')[2]
      const marketName=event.target.id.split('-')[3]
      handleGoMarket({marketTenant,marketName})
      return
  }
  if(event.target.id!=='sz-modal-data' && !event.target?.id.includes('sz-market-')){
    emits('removeSZLabel')
  }
})
/** 跳转到二级市场 */
const getMarketToken = async (data:{
  account: string,
  password: string,
  url: string
}): Promise<{ access_token: string, tenants: string[] }> => {
  return new Promise((resolve, reject) => {
    const params = {
      grant_type: "client_credentials",
      client_id: data.account,
      client_secret: data.password,
    }
    axios.post(`${data?.url}/api/ouaa/oauth/token`, qs.stringify(params)).then(async (value) => {
      resolve(value.data)
    }).catch((error) => {
      resolve(null)
      message.destroy()
      // message.error({
      //   content: error,
      //   style: {
      //     position: "fixed",
      //     zIndex: 1000,
      //     top: `10%`,
      //     left: '46%'
      //   }
      // })
    })
  })
}
const hrefToSubMarket = async (marketTenant:string):Promise<void>=>{
  message.destroy()
  const marketTenantsV1 = piniaStoreArea.marketDataSZ?.filter(e => e?.version?.includes('1.0')).map(e => (e.marketTenant || e.tenant).toString())
  const curTenant = marketTenant.toString()
  if (marketTenantsV1.includes(curTenant)) {
    return
  }
  message.loading('正在获取跳转')
  getMarketConfig({ id: marketTenant }).then(async (data) => {
    let projectId = (window as any).config?.feature?.subMarketList?.find((item) => item.tenant === marketTenant+'')?.projectId
    const marketData = [...piniaStoreArea.marketDataCN, ...piniaStoreArea.marketDataSZ]
    const cur = marketData.find(e => e.marketTenant === marketTenant)
    if (cur) {
      projectId = cur?.projectId
    }
    const res = await getMarketToken(data)
    const url = `${data?.url}/apps-legacy/ue5/?tenant=${res?.tenants?.[0] ?? marketTenant}&projectId=${projectId}&menuName=${encodeURIComponent(piniaStoreMenu.currentMenu ?? '')}&access_token=${res.access_token}`
    window.open(url, '_blank')
  }).catch((error) => {
    message.error("跳转失败")
  })
}
const loading = ref(false)
onMounted(async()=>{
})
</script>
<style lang="less" scoped>
.top {
  margin-left: 10px;
  font-size: 16px;
  font-family: YouSheBiaoTiHei;
  font-weight: 400;
  line-height: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #7aa9f6 100%);
  -webkit-background-clip: text;
  color: transparent;
}

.market-list {
  padding: 0 10px;
  margin-top: 20px;
  display: grid;
  grid-gap: 10px;
  overflow-y: auto;
  padding-bottom: 15px;
  &.grid-2 {
    grid-template-columns: repeat(2, 1fr);
    // max-height: 200px;
  }
  &.grid-3 {
    grid-template-columns: repeat(3, 1fr);
    // max-height: 400px;
  }

  .market-item {
    background: rgba(204, 223, 255, 0.10);
    padding: 10px 18px;
    text-align: center;
    cursor: pointer;
    pointer-events: auto !important;
    font-size: 20px;
    font-family: Source Han Sans CN, Source Han Sans CN-Regular;
    font-weight: Regular;
    text-align: left;
    color: #e2edff;
    position: relative;
    &.market-item-green {
      background: rgba(9,124,78,0.30);
    }
    &:hover {
      background: #3f7cdf;
      color: #fff;
    }
  }
}

.modal-wrap {
  cursor: pointer;
  pointer-events: auto;
  top: 0;
  left: 0;
  // position: absolute;
  // top: 0;
  // left: 0;
  z-index: 1000;
  width: 100%;
  min-height: 100px;
  // border: 50px solid yellowgreen;
  background-image: url("/resource/v1/ue5-sn-migrate/assets/images/sn/bk.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 15px;
  // overflow: hidden;
}
.version-wrap{
  position: absolute;
  top: 0;
  right: 0px;
  padding: 0px 6px;
  display: flex;
  align-items: center;
  background: linear-gradient(6deg, rgba(127, 158, 226, 0.16) 3%, rgba(157, 174, 211, 0.08) 100%);
  border-radius: 4px;
}
.version{
  font-size: 16px;
  font-family: D-DIN-Bold;
  font-weight: bold;
  // background: linear-gradient(180deg, #ffffff 28%, #a1bffc 78%);
  // -webkit-background-clip: text;
  // -webkit-text-fill-color: transparent;
  font-style: oblique;
  color: #a1bffc;
}
</style>
