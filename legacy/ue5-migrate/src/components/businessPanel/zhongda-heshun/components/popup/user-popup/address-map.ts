import { getAddressByLngLat } from '@/pages/event/register/gis'

const addressMap = new Map<string, string>();
/** 获取地址 */
export async function getAddress (lng: number, lat: number): Promise<string> {
  let res = addressMap.get(`${lng},${lat}`);
  if (!res){
    res = await getAddressByLngLat(lng, lat)
    addressMap.set(`${lng},${lat}`, res)
  }
  return res;
}