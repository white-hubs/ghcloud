import { request } from "@/service";

//巡检点分类列表
export const getInspectSceneTypeList = () => {
  return request.get('/maintain/inspect/sceneTypeList');
};

//巡检点分类列表
export const getInspectpointList = (params:unknown) => {
  return request.get('/maintain/inspect/pointList',{params});
};

