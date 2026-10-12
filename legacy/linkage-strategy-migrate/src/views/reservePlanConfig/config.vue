<template>
    <div class="content">
        <g-layout title="预案设置">
            <template #content-table>
                <div class="top-tabs">
                    <a-tabs v-model:activeKey="activeKey">
                        <a-tab-pane key="1" tab="联动预案">
                            <linkage-strategy></linkage-strategy>
                        </a-tab-pane>
                    </a-tabs>
                </div>
            </template>
        </g-layout>
    </div>
</template>

<script>
import { defineComponent ,reactive, ref, toRefs} from "vue"
import linkageStrategy from "./components/linkageStrategy.vue"

export default defineComponent({
    components:{
        linkageStrategy,
    },
    setup() {
        const activeKey = ref("1");
        const state = reactive({
            
        })
        return{
            ...toRefs(state),
            activeKey,
        }
    }
})
</script>
<style lang="less" scoped>
.top-tabs{
    height: 100%;
}

</style>

<style lang="less" scoped>
:deep(.content-search){
    padding-top: 0 !important;
}
:deep(.ant-tabs-bar){
    margin: 0;
}
</style>