<template>
  <div class="group">
    <div class="overlap-group">
      <div class="div">
        <slot />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { getMarketConfig } from "@/api/shennong/alarm";
import { storeMarket } from "@/piniaStore/other";
import axios from "axios";
import qs from "qs";
import { message } from "ant-design-vue";
import { storeMenu } from "@/piniaStore/menu";
import { storeArea } from "@/piniaStore/area"
const piniaStoreArea = storeArea()

  interface Props { 
    labelData: {
      name: string | null;
    };
  }
  const props = withDefaults(defineProps<Props>(), {
    labelData: {
      name: null,
    }
  });
  const piniaStoreMarket = storeMarket();
  const piniaStoreMenu = storeMenu();
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
    axios
    .post(`${data?.url}/api/ouaa/oauth/token`, qs.stringify(params))
    .then(async (value) => {
      resolve(value.data)
    }).catch((error) => {
      resolve(null)
      message.destroy()
    })
  })
}

const hrefToSubMarket = async (marketTenant:string):Promise<void>=>{
  message.destroy()
  message.loading('正在获取跳转')
  getMarketConfig({ id: marketTenant }).then(async (data) => {
    let projectId = (window as any).config?.feature?.subMarketList?.find((item) => item.tenant === marketTenant+'')?.projectId
    const marketData = [...piniaStoreArea.marketDataCN, ...piniaStoreArea.marketDataSZ]
    const cur = marketData.find(e => e.marketTenant === marketTenant)
    if (cur) {
      projectId = cur?.projectId
    }
    const res = await getMarketToken(data)
    message.destroy()
    const url = `${data?.url}/apps-legacy/ue5/?tenant=${res?.tenants?.[0] ?? marketTenant}&projectId=${projectId}&menuName=${encodeURIComponent(piniaStoreMenu.currentMenu ?? '')}&access_token=${res.access_token}`
    window.open(url, '_blank')
  }).catch((error) => {
    message.error("跳转失败")
  })
}
  
  window.addEventListener("mousedown", (event) => {
    if(event.target.id == "linkMarketButton"){
      handleLabelClick()
    }
  })
  const handleLabelClick = () => {
    const marketData = [...piniaStoreArea.marketDataCN, ...piniaStoreArea.marketDataSZ]
    const marketTenantsV1 = marketData?.filter(e => e?.version?.includes('1.0')).map(e => (e.marketTenant || e.tenant).toString())
    const curTenant = piniaStoreMarket.currentMarketTenant.toString()
    if (marketTenantsV1.includes(curTenant)) {
      return
    }
    hrefToSubMarket(piniaStoreMarket.currentMarketTenant)
  }
    
  defineExpose({
    handleLabelClick,
    hrefToSubMarket,
  });
</script>
<style scoped>
.group {
  pointer-events: auto;
  width: 600px;
  margin-top: 120px;
  margin-left: 120px;
  z-index: 1000;

}

.group .div {
  z-index: 1001;
}

.group .overlap-group {
  position: relative;
  z-index: 1001;
}
</style>