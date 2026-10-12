import { ref } from 'vue'
import axios from 'axios'
import qs from 'qs'
import { getMarketConfig } from '@/api/shennong/alarm'

/** 显示报警详情弹窗 */
export const openAlarmDetail = async (record, apiFunction=(...args)=>{}) => {
  try {
    const data = await getMarketConfig({ id: record.marketTenant });
    sessionStorage.setItem("market-tenant", data?.marketTenant);
    const params = {
      grant_type: "client_credentials",
      client_id: data.account,
      client_secret: data.password,
    };
    const value = await axios.post(`${data?.url}/api/ouaa/oauth2/token`, qs.stringify(params))
    sessionStorage.setItem("market-token", value.data.access_token);
    sessionStorage.setItem("market-baseUrl", data?.url);
    if(typeof apiFunction === 'function') {
      apiFunction({...data, ...value.data})
    }
    } catch (error) {
      sessionStorage.removeItem("market-token");
      sessionStorage.removeItem("market-baseUrl");
      sessionStorage.removeItem("market-tenant");
    }
}

/** 关闭报警详情弹窗 */
export const removeMarketToken = () => {
  sessionStorage.removeItem("market-token");
  sessionStorage.removeItem("market-baseUrl");
  sessionStorage.removeItem("market-tenant");
}