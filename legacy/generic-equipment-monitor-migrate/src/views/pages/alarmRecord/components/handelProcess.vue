<template>
    <div class="item-title">处理流程记录</div>
    <a-table :data-source="data" :columns="columns" :pagination="false" :bordered="true" size="small"
        :loading="loading"></a-table>
</template>

<script lang="jsx">
import moment from "moment";
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs } from "vue";
import { useRoute } from "vue-router";
import { cubeAlarmCenterService } from '@/api/service'
export default defineComponent({
    setup() {
        const route = useRoute()
        const { id } = route.query;
        const { proxy } = getCurrentInstance();
        const state = reactive({
            loading: false,
            data: [],
            columns: [
                {
                    title: '时间',
                    dataIndex: 'operatorTime',
                    slots: {
                        customRender: 'operatorTime'
                    },
                    customRender: ({ text }) => {
                        return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--"
                    }
                },
                {
                    title: '操作人',
                    dataIndex: 'operatorByName',
                },
                {
                    title: '处理内容',
                    dataIndex: 'operatorContent',
                },
            ]
        })
        onMounted(() => {
            getAlarmHandleProcess()
        })
        // 获取处理流程
        const getAlarmHandleProcess = async () => {
            state.loading = true
            const processList = await proxy.$api.getAlarmHandleProcess({ id: id })
            state.data = processList
            state.loading = false
        }
        return {
            ...toRefs(state)
        }
    }
})
</script>

<style lang="less" scoped>
.item-title {
  width: 100%;
  height: auto !important;
  text-align: left;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #000000D9;
  border-top: 1px solid #e8e8e88c;
  padding-top: 16px !important;
  font-family: PingFang SC-Medium;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}
</style>