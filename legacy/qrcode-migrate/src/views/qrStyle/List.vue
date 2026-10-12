<template>
    <div class="content">
        <g-table title="二维码样式" tableCode="QR_STYLE" :api="api" :btns="btns" :search="search" :columns="columns" editMode="page"
            :rowSelection="true">
            <template #btn="{record}">
                <a-button type="link" @click="previewStyle(record)">预览</a-button>
                <a-button type="link" @click="copyStyle(record)">复制</a-button>
            </template>
        </g-table>
        <a-modal v-if="visible" centered v-model:visible="visible" title="二维码样式预览" :width="Number(activeRecord.width)*qrCodeScale + 48"
            :footer="null">
            <preview ref="previewModal" :designConfig="activeRecord" type='preview'></preview>
        </a-modal>
    </div>
</template>
<script>
import { defineComponent, reactive, toRefs, ref } from "vue"
import preview from "../components/preview.vue"
import { routerKey, useRouter } from "vue-router";

export default defineComponent({
    components: { preview },
    setup(props) {
        const previewModal = ref(null);
        const activeRecord = ref(null);
        const state = reactive({
            api: {
                list: "qrcodeStylePage",
                deleteSingle: "deleteQrcodeStyle",
                delete: "batchDeleteQrcodeStyle",
                path: "/editQrStyle"
            },
            btns: ["add", "edit", "deleteSingle", "delete"],
            search: [
                { label: "", value: "keyword", placeholder: "名称查询" },
            ],
            columns: [
                {
                    title: "编号",
                    dataIndex: "code",
                    key: "code",
                },
                {
                    title: "名称",
                    dataIndex: "name",
                    key: "name",
                },
                {
                    title: "大小",
                    dataIndex: "size",
                    key: "size",
                    customRender: ({ text, record }) => {
                        return `${record.width}*${record.height}`
                    }
                },
                {
                    title: "更新时间",
                    dataIndex: "updateTime",
                    key: "updateTime",
                },
                {
                    title: '操作',
                    dataIndex: 'action',
                    key: 'action',
                    slots: {
                        customRender: "action",
                    },
                }
            ],
            visible: false,
            qrCodeScale:1,
        })
        const previewStyle = (record) => {
            activeRecord.value = JSON.parse(record.configJson);
            state.qrCodeScale=activeRecord.value.width>800?800/activeRecord.value.width:1
            state.visible = true;
        }
        const router=useRouter()
        const copyStyle= (record) => {
            router.push({path: '/editQrStyle',
            query: {
              type:'copy',
              id: record.id,
            },})
        }
        return {
            ...toRefs(state),
            previewModal,
            activeRecord,
            previewStyle,
            copyStyle
        }
    }
})
</script>

<style lang="less" scoped>
:deep(.ant-table-column-title){
  .anticon-setting{
    margin-right: 14px;
  }
}
</style>