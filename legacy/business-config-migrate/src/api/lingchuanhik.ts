import { message } from 'ant-design-vue'
import axios from 'axios'
import { authStore } from './auth-store'

let baseURL = "/api/lingchuan-hik";

// 获取海康地图区域树
export const getHikMapArea = async (): Promise<HikMapArea[]> => {
  try {
    const response = await axios({
      url: baseURL+ '/hik/area/map-view-tree',
      method: 'get',
      params: {},
      headers: {
        tenant: authStore.tenant,
        terminal: authStore.terminal,
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    });
    if (Array.isArray(response.data)) {
      return response.data as HikMapArea[];
    } else {
      return [];
    }
  } catch (error) {
    handleError(error)
    return []
  }
};
// 海康地图区域关联系统区域
export const refHikMapArea = async (params: {
  areaId: string;
  code: string;
}): Promise<unknown> => {
  try {
    const response = await axios({
      url: baseURL+'/hik/area/map-view-tree/ref',
      method: 'post',
      data: params, 
      headers: {
        tenant: authStore.tenant,
        terminal: authStore.terminal,
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data
  } catch (error) {
    handleError(error)
    return null
  }
};

// 提取错误处理逻辑
const handleError = (error: any) => {
  if (axios.isAxiosError(error)) {
    message.error(`请求失败: ${error.response?.data?.message || error.message}`);
  } else {
    // message.error('操作失败，请稍后重试');
  }
};

export interface HikMapArea {
  /**
   * 子级区域
   */
  children?: { [key: string]: any }[];
  /**
   * 区域节点编码
   */
  code: string;
  /**
   * 主键
   */
  id: string;
  /**
   * 区域节点名称+已上图的点位数量
   */
  label: string;
  /**
   * 区域节点名称
   */
  name: string;
  /**
   * 区域节点父编码
   */
  parentCode: string;
  /**
   * 区域路径
   */
  path: string;
  /**
   * 排序
   */
  sort: number;
  /**
   * 系统区域信息
   */
  systemArea?: SystemArea;
}

/**
* 系统区域信息
*/
export interface SystemArea {
  /**
   * 系统区域id
   */
  id: string;
  /**
   * 系统区域名称
   */
  name: string;
}

