import { defineStore } from 'pinia'
export const storeMarket = defineStore('storeOther',{
    state:() =>{
        return {
            currentMarket:'',
            currentMarketTenant:'',
            currentMarketName:'',
            currentDataType:'device',
            alarmBusinessKey:'',
            alarmDeviceRisk:[],
            selectDevice:{},
            patrolRouterId:'',
            deviceAreaNameList:[],
            showLabel:'开',
            doorDeviceId:''
        }
    },
    getters:{
        
    },
    actions:{

    }
})