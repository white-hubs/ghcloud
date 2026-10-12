import { defineStore } from 'pinia'
export const roamingDevices = defineStore('roamingDevices',{
    state:() =>{
        return {
            roamingDevicesArr: [],
            isRoaming: true,
            cameraViewSuccess:0
        }
    },
    getters:{
        
    },
    actions:{

    }
})