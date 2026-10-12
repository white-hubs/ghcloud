import {ref} from "vue"
import {getAssetsImage} from "@/utils/getImage"
import moment from "moment"
export default () =>{
    const column = ref([
        {
            title:"上报时间",
            dataIndex:"time",
            width:120
        },
        {
            title:"巡逻点",
            dataIndex:"patrol",
        },
        {
            title:"上报人",
            dataIndex:"reportPerson",
            width:60
        },
        // {
        //     title:"现场照片",
        //     dataIndex:"photos",
        //     slots:{
        //         customRender:"photos"
        //     },
        // }
    ])
    const data = ref([
        {
            time:moment().format("YYYY-MM-DD")+" 04:25",
            patrol:"冻品区1号棚",
            reportPerson:"王坤",
            photos:{
                id:1,
                name:"照片1",
                url:getAssetsImage('xf.png')
            }
        },
        {
            time:moment().format("YYYY-MM-DD")+" 04:36",
            patrol:"冻品区2号棚",
            reportPerson:"王坤",
            photos:{
                id:1,
                name:"照片1",
                url:getAssetsImage('xf.png')
            }
        },
        {
            time:moment().format("YYYY-MM-DD")+" 07:22",
            patrol:"蔬菜区1号棚",
            reportPerson:"王坤",
            photos:{
                id:1,
                name:"照片1",
                url:getAssetsImage('xf.png')
            }
        },
        {
            time:moment().format("YYYY-MM-DD")+" 07:35",
            patrol:"冻品区6号棚",
            reportPerson:"王坤",
            photos:{
                id:1,
                name:"照片1",
                url:getAssetsImage('xf.png')
            }
        },
        {
            time:moment().format("YYYY-MM-DD")+" 09:15",
            patrol:"蔬菜区4号棚",
            reportPerson:"王坤",
            photos:{
                id:1,
                name:"照片1",
                url:getAssetsImage('xf.png')
            }
        },
        {
            time:moment().format("YYYY-MM-DD")+" 09:33",
            patrol:"2号进场口",
            reportPerson:"王坤",
            photos:{
                id:1,
                name:"照片1",
                url:getAssetsImage('xf.png')
            }
        }
    ])
    return {
        column,
        data
    }
} 

