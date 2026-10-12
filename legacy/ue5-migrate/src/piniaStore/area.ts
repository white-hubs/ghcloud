import { defineStore } from 'pinia'
export const storeArea = defineStore('storeArea', {
    state: () => {
        return {
            currentAreaLeave: 1,    /**当前区域级别 */
            currentAreaId: '',
            modalNames:{
                name:'',
                area:''
            },
            currentSequence: '',
            currentContainerId: '', //当前ue5查询范围 在打标签的时候用到 可以是楼栋或者楼层的 actorId
            equipmentId: '',
            currentModalNames: '', //当前视角
            currentBuild: null, //当前楼栋
            currentFloor: null, // 当前楼层
            chinaMapDrillDown: null, // 记录地图下钻
            marketDataCN: null, // 中国市场标签数据
            marketDataSZ: null, // 深圳市场标签数据
        }
    },
    getters: {

    },
    actions: {

    }
})