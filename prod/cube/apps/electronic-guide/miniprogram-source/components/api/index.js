import {
  request
} from '../service/request';

// 获取区域层级信息
export const getAreaLayer = (params) => {
  return request('/layer/state', 'GET', {
    ...params
  });
};

// 获取区域树形结构列表
export const getRegionTreeList = () => {
  return request('/guide/area/tree', 'GET', {
    state: 'ENABLE'
  });
};

// 获取区域详细信息
export const getRegionInfo = (regionId) => {
  return request(`/guide/area/${regionId}`, 'GET');
};

// 获取点位类型
export const getPointType = () => {
  return request('/point-types', 'GET');
};

// 获取点位列表
export const getPointList = (params) => {
  return request('/point/anage/page', 'GET', {
    pageNumber: 1,
    pageSize: 1000,
    ...params,
    areaAccurateMatching: true,
    sequence: true
  });
};