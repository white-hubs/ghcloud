import { reactive } from "vue";
export default () =>{
    const modalParams = reactive({
        title:'空调报警明细',
        selectItem:[
            {
                title:'时间',
                key:'date',
                type:'rangePicker',
            },
            {
                title:'报警设备',
                key:'keyword',
                type:'input'
            }
        ],
        columns:[
            {
                title:'时间',
                dataIndex:'date',
            },
            {
                title:'报警设备',
                dataIndex:'deviceName'
            },
            {
                title:'报警事件',
                dataIndex:'event'
            },
            {
                title:'处理状态',
                dataIndex:'status',
                slots:{
                    customRender:'status'
                },
                customRender:({text,record}) =>{
                    
                }
            }
        ],
        requestData:(parmas) =>{
            
        }
    })
    return {
        modalParams
    }
}

