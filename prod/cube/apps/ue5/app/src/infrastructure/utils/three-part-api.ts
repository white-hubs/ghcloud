import { ALIYUN_WEATHER_APPCODE, isWeatherApiAvailable } from "@/constants/env";

export { isWeatherApiAvailable };

/**
 * 阿里云市场的天气API，全国天气预报查询
 * @doc https://market.aliyun.com/apimarket/detail/cmapi00044244#sku=yuncode3824400009
 */
const fetchWeather = async (url: string): Promise<string> => {
  if (!isWeatherApiAvailable()) {
    throw new Error("Weather API APPCODE is not configured");
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `APPCODE ${ALIYUN_WEATHER_APPCODE}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const res = (await response.json()) as {
    data?: {
      info?: {
        now?: {
          weather?: string;
        };
      };
    };
  };
  const weather = res.data?.info?.now?.weather;
  if (!weather) {
    throw new Error("Weather API returned empty payload");
  }
  return weather;
};

export const fetchWeatherByIp = async (ip: string): Promise<string> => {
  return fetchWeather(`https://qryweather.market.alicloudapi.com/lundroid/queryweatherfromip?&ip=${encodeURIComponent(ip)}`);
};

export const fetchWeatherByLocation = async (location: { lat: number; lng: number }): Promise<string> => {
  return fetchWeather(
    `https://qryweather.market.alicloudapi.com/lundroid/queryweatherfromlocation?&lat=${location.lat}&lng=${location.lng}`,
  );
};
