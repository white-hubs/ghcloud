<template>
  <g-layout :title="pageTitle || '关联区域'">
    <template #content-table >
      <a-table :columns="columns" :loading="loading" :dataSource="dataSource" childrenColumnName="children" :pagination="false" size="small" :scroll="{ x: 770,y: tableHeight}">
        <template #action="{record}">
          <a-button type="link" @click="handleSoundModal(record)">关联系统区域</a-button>
        </template>
      </a-table>
    </template>
  </g-layout>
  <RelateModal ref="relateModalRef" @enter="handleEnter" />
</template>
<script lang="jsx">
import { defineComponent, toRefs,  reactive, createVNode, ref, nextTick, getCurrentInstance, onMounted, } from "vue";
import { useRouter } from "vue-router";
import RelateModal from './components/relate-modal.vue'
import { usePageName } from '@ghcloud/cube-utils'
import { getHikMapArea } from '@/api/lingchuanhik.ts'
import { cubeMdataService } from "@/api/service";

export default defineComponent({
  components: {
    RelateModal,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const { pageTitle } = usePageName()

    const state = reactive({
      btns: [],
      api: {
        list: "getHikMapArea",
        detail: "record",
        path: "",
      },
      tableHeight: 0,
      columns: [
        {
          dataIndex: "name",
          key: "name",
          title: "区域名称",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                <span>{text || "--"}</span>
              </PopOver>
            );
          },
        },
        {
          dataIndex: "code",
          key: "code",
          title: "区域编号",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                <span>{text || "--"}</span>
              </PopOver>
            );
          },
        },
        {
          dataIndex: "systemArea",
          key: "systemArea",
          title: "系统区域",
          ellipsis: true,
          customRender: ({ record }) => {
            const textVal = record?.systemArea && record?.systemArea?.name
            return (
              <PopOver position="topLeft" content={textVal}>
                {textVal || "--"}
              </PopOver>
            );
          },
        },
        {
          title: '操作',
          dataIndex: 'action',
          slots: {
            customRender: 'action'
          }
        },
      ],
      loading: false,
      dataSource: []
    });
    const relateModalRef = ref()
    const handleSoundModal = (record) => {
      relateModalRef.value?.openModal(record)
    }
    const handleEnter = () => {
      getTableData()
    }
    const getTableData = async () => {
      try {
        const res = await getHikMapArea()
        if(res){
          state.dataSource = res;
        }
      } catch (error) {
      } finally{
        state.loading = false;
      }
    };
    onMounted(async () => {
      getTableData();
      await nextTick()
      setTimeout(() => {
        const contentHei = document.querySelector(".view_content .ant-layout-content").clientHeight;
        state.tableHeight = contentHei - 205;
      }, 100);
    });
    return {
      ...toRefs(state),
      handleSoundModal,
      relateModalRef,
      handleEnter,
      pageTitle,
    };
  },
});
</script>
<style lang="less" scoped></style>
