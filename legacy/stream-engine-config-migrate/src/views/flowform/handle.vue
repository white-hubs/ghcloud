<template>
  <div class="detail-container">
    <form-render ref="form" :forms="formFlow.formJson" :flowJson="formFlow.flowJson" :nodeId="formFlow.nodeId" v-model="formData" />
    <div>
        <el-button size="small" type="primary" @click="submit">完成</el-button>
        <el-button size="small" type="danger" @click="refuse">拒绝</el-button>
    </div>
  </div>
</template>

<script>
import FormRender from '@/views/common/form/FormRender'

export default {
    components:{
        FormRender
    },
    data(){
        return {
            formFlow:{
                formJson:[]
            },
            formData:{}
        }
    },
    created(){
        this.getData()
    },
    methods:{
        getData(){
            this.$api.getProcessTaskForm({id:'ebbae0d1-6189-11ed-9d88-00ff4d7401e5'}).then(res=>{
                this.formFlow = {
                    nodeId:res.key,
                    formJson:JSON.parse(res.properties.formJson),
                    flowJson:res.properties.processJson
                }
                this.formData = JSON.parse(res.data)
            })
        },
        getFormJson(formJson,flowJson,key){
            if(formJson){
                if(flowJson){
                    let formPerms =  this.getFormPerms(JSON.parse(flowJson),key) 
                    let form = JSON.parse(formJson)
                    let arr = []
                    formPerms.forEach(item=>{
                        form.forEach((f,fi)=>{
                            if(item.perm !== 'H'&&item.id === f.id){
                                if(item.perm === 'R'){
                                    f.props.disabled = true
                                }
                                arr.push(f)
                            }
                        })
                    })
                    return arr
                }else{
                    return JSON.parse(formJson)
                }
            }else{
                return []
            }
        },
        getFormPerms(flowJson,key){
            if(flowJson.id === key){
                return flowJson.props.formPerms
            }else if(flowJson.children) {
                return this.getFormPerms(flowJson.children,key)
            }
        },
        submit(){
            this.$api.postProcessTaskComplete({
                taskId:'ebbae0d1-6189-11ed-9d88-00ff4d7401e5',
                account:null,
                data:JSON.stringify(this.formData),
                result:'PASS',
            }).then(res=>{
                this.$message.success('操作成功')
            })
        },
        refuse(){
            this.$api.postProcessTaskReject({
                taskId:'ebbae0d1-6189-11ed-9d88-00ff4d7401e5',
                account:null,
                comment:null,
                data:JSON.stringify(this.formData),
            }).then(res=>{
                this.$message.success('操作成功')
            })
        },
    }
}
</script>

<style lang="less" scoped>
.detail-container{
    padding: 50px;
}
</style>