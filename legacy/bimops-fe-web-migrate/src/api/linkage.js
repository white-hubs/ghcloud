import request from "@/utils/request";

const baseURL = "/api/linkage";

//根据事件获取摄像机动作列表
// getEventVideo
export const getEventVideo = (params, header) =>
  request({
    url: baseURL + `/event-video/${params.id ? params.id : params}`,
    method: "get",
    params,
    header
  });
