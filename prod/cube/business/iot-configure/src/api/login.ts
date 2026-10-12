import { request } from '@/service'
export const login = (data: {
  userName: string;
  password: string;
}): any => {
  return request.post('/api/login', data)
}
/** getwaytree */
export const getGetwayTree = async (data: {
  keyword: string;
  levelNeed: number;
}) => {
  return request.post('/gateway/treeTitle', data)
}
