import { defineStore } from 'pinia'
export const storeMarket = defineStore('storeOther',{
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
            panelCurrentDeviceId:'',
            deviceDetailsPanelActive:'',
            deviceIconPioList:[]
        }
    },
    getters:{
        
    },
    actions:{

    }
})