import { reactive } from 'vue'
import type { PatrolPointVo } from '@ghcloud/cube-electronic-patrol-service'
interface StateVo {
  pointVo: PatrolPointVo;
  patrolUser: {
    id: string;
    name: string;
  };
}
const storeState = reactive<StateVo>({
  pointVo: {
    id: '',
    locationId: '',
    locationName: '1号门',
    taskName: '',
    nfcCode: '',
    bluetoothCode: '',
    arae: [{
      name: '1号门',
      id: '',
      level: 0,
      children: [],
      code: '',
      sequence: '',
      enabled: false,
      areaManagerId: ''
    }],
    userId: '',
    userName: '',
    startDate: 0,
    endDate: 0,
    patrolResult: '',
    hiddenId: '',
    remark: '',
    orderNum: 0,
    nfcLongitude: '',
    nfcDimension: '',
    patrolWay: '',
    files: []
  },
  patrolUser: { id: '', name: '超级管理员' }
})
interface StoreVo extends StateVo {
  setPatrolPointVo: (pointVo: PatrolPointVo) => void;
  setPatrolUser: (patrolUser: { id: string; name: string; }) => void;
}
export function usePatrolStore (): StoreVo {
  const setPatrolPointVo = (pointVo: PatrolPointVo): void => {
    storeState.pointVo = pointVo
    sessionStorage.setItem('patrolPointVo', JSON.stringify(pointVo))
  }
  const setPatrolUser = (patrolUser: { id: string; name: string; }): void => {
    storeState.patrolUser = patrolUser
    sessionStorage.setItem('patrolUser', JSON.stringify(patrolUser))
  }
  return {
    ...storeState,
    setPatrolUser,
    setPatrolPointVo
  }
}
export const handleStorePatrolPoint = (pointVo: PatrolPointVo): void => {
  const patrolStore = usePatrolStore()
  const initArea = {
    id: '',
    parentId: '',
    level: 1,
    children: [],
    name: '--',
    code: '',
    sequence: '',
    enabled: true,
    areaManagerId: ''
  }
  const point = {
    ...pointVo,
    arae: pointVo.arae.length ? pointVo.arae : [initArea]
  }
  patrolStore.setPatrolPointVo(point)
}
