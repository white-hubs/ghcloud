import qs from "qs"
export const getParams=()=>{
  const params=window.location.search?.split("?")[1]
  return qs.parse(params);
}