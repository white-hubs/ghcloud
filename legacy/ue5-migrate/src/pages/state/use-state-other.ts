import { defineStore } from 'pinia'
export const storeMarket = defineStore('useStoreOther',{
    state:() =>{
        return {
            currentMarket:'',
            currentMarketName:'',
            currentDataType:'device',
            alarmBusinessKey:'',
            alarmDeviceRisk:[],
            selectDevice:{},
            patrolRouterId:'',
            deviceAreaNameList:[],
            showLabel:'开',
            doorDeviceId:'',
            currentDeviceId:''
        }
    },
    getters:{
        
    },
    actions:{

    }
})