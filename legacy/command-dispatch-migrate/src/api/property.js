import request from "@/utils/request";
let baseURL = "/api/property";
// 消防栓风险源分页查询
export const getRiskDeviceList = () =>
  request({
    url: baseURL + `/risk/source/ledger/with/location`,
    method: "get",
    params: {
      size: 10,
      typeCodes: 'FIRE_HYDRANT,ANNIHILATOR'
    },
  });