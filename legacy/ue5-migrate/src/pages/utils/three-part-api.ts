/**
 * 阿里云市场的天气API，全国天气预报查询
 * @doc https://market.aliyun.com/apimarket/detail/cmapi00044244#sku=yuncode3824400009
*/
export const fetchWeatherByIp = async (ip: string): Promise<string> => {
  const response = await fetch(
    `https://qryweather.market.alicloudapi.com/lundroid/queryweatherfromip?&ip=${ip}`,
    {
      method: 'GET',
      headers: {
        Authorization: 'APPCODE 80751a3b98794bacb366cd0ccf80db86',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res = await response.json();
  return res.data.info.now.weather
}

export const fetchWeatherByLocation = async (location: {lat: number; lng: number;}): Promise<string> => {
  const response = await fetch(
    `https://qryweather.market.alicloudapi.com/lundroid/queryweatherfromlocation?&lat=${location.lat}&lng=${location.lng}`,
    {
      method: 'GET',
      headers: {
        Authorization: 'APPCODE 80751a3b98794bacb366cd0ccf80db86',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res = await response.json();
  return res.data.info.now.weather
}
