<template>
  <div class="detail-container">
    <form-render ref="form" :forms="formFlow.formJson" :flowJson="formFlow.flowJson" nodeId="root" v-model="formData" />
    <div>
        <el-button size="small" type="primary" @click="submit">发起</el-button>
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
        if(sessionStorage.getItem("GH-Token")){
            let userInfo = JSON.parse(sessionStorage.getItem("GH-Token"))
            this.formData.sponsorId = '2'
        }
        this.getData()
    },
    methods:{
        getData(){
            this.$api.getFormFlowBusiness({businessType:'attendance-leave'}).then(res=>{
                this.formFlow = {
                    ...res,
                    flowJson:res.flowJson,
                    formJson:JSON.parse(res.formJson),
                }
            })
        },
        getFormJson(formJson,flowJson){
            if(formJson){
                if(flowJson){
                    let formPerms = JSON.parse(flowJson).props.formPerms
                    let form = JSON.parse(formJson)
                    let arr = []
                    formPerms.forEach(item=>{
                        form.forEach((f,fi)=>{
                            if(item.perm === 'E'&&item.id === f.id){
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
        submit(){
            this.$api.postFormFlowsFirst({
                type:this.formFlow.type,
                application:this.formFlow.application,
                applicationName:this.formFlow.applicationName,
                businessType:'attendance-leave',
                flowKey:this.formFlow.flowKey,
                formKey:this.formFlow.formKey,
                formDefinitionVersion:this.formFlow.formDefinitionVersion,
                data:JSON.stringify(this.formData),
            }).then(res=>{
                this.$message.success('操作成功')
            })
        }
    }
}
</script>

<style lang="less" scoped>
.detail-container{
    padding: 50px;
}
</style>