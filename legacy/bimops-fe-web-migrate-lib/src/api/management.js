import request from "../utils/request";
let baseURL = "/api/management";

// 公告分页信息
export const getAnnouncementPage = (params, method = "get") =>
  request({
    url: baseURL + `/announcement/page`,
    method: "get",
    params,
  });
