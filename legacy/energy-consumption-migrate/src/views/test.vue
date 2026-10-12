<template>
  <div>
    <Operates :operateButtons="operateButtons" type="add" @submit="submit" @go-back="goBack" @process="processHandle"></Operates>
  </div>
</template>
<script setup>
import {ref} from 'vue'
import {Operates} from '@ghcloud/cube-stream-engine-ui'
import { CubeStreamSDK } from '@ghcloud/cube-stream-engine-core'
import { authStore } from '@/api/auth-store'
import { onMounted } from 'vue';
CubeStreamSDK.init({ authStore })
const cubeStreamSDK = CubeStreamSDK.getInstance()
const operateButtons=ref([])
onMounted(async()=>{
  await cubeStreamSDK.OPERATES.getTaskDetail('69adac09-402d-11ef-82e0-fae0e9e43fb0')
  const userID = sessionStorage.getItem("GH-Token") ? JSON.parse(sessionStorage.getItem("GH-Token")).id : null;
  operateButtons.value=await cubeStreamSDK.OPERATES.getOperateButtons('',{ id: userID })
})
//提交
const submit=()=>{
  const userName = sessionStorage.getItem('GH-UserInfo') ? JSON.parse(sessionStorage.getItem('GH-UserInfo')).name : ''
  cubeStreamSDK.OPERATES.processSubmit()
}
//返回
const goBack=()=>{
  cubeStreamSDK.OPERATES.goBack()
}
//流程节点提交
const processHandle=(item)=>{
  cubeStreamSDK.OPERATES.processHandle('add','69adac09-402d-11ef-82e0-fae0e9e43fb0',item)
}
</script>