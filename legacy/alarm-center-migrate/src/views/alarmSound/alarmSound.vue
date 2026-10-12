<template>
  <g-table :title="pageTitle ?? '报警音频配置'" tableCode="ALARM_CENTER_ALARM_SOUND" :columns="columns" :search="search"
    :api="api" :btns="btns" :scrollX="0" ref="tableRef" >
    <template #beforeBtn="{record}">
      <a-button type="link" @click="handleSoundModal(record)">配置音频</a-button>
      <a-button type="link" @click="handlePlay(record)" v-if="record?.file">播放</a-button>
    </template>
  </g-table>
  <SoundModal ref="soundModalRef" @enter="handleEnter" />
</template>
<script lang="jsx">
import { defineComponent, toRefs,  reactive, createVNode, ref,  getCurrentInstance, onMounted, } from "vue";
import { useRouter } from "vue-router";
import SoundModal from './components/sound-modal.vue'
import { cubeAlarmCenterService } from "@/api/service";
import { usePageName } from '@ghcloud/cube-utils'
export default defineComponent({
  components: {
    SoundModal,
  },
  setup() {
    const tableRef = ref();
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const { pageTitle } = usePageName()

    const state = reactive({
      btns: [],
      api: {
        list: "getAlarmLevelSoundConfig",
        detail: "record",
        path: "",
      },
      columns: [
        {
          dataIndex: "name",
          key: "name",
          title: "报警级别",
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
          dataIndex: "playNum",
          key: "playNum",
          title: "播放次数",
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
          dataIndex: "looped",
          key: "looped",
          title: "是否循环播放",
          ellipsis: true,
          customRender: ({ text }) => {
            const textVal = text ? '是' : '否';
            return (
              <PopOver position="topLeft" content={textVal}>
                <span style={{ color: text ? '#D9001B' : '' }}>{textVal || "--"}</span>
              </PopOver>
            );
          },
        },
        {
          dataIndex: "sound",
          key: "sound",
          title: "报警音频",
          ellipsis: true,
          customRender: ({ record }) => {
            const textVal = record?.file?.name
            return (
              <PopOver position="topLeft" content={textVal}>
                <span>{textVal || "--"}</span>
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
    const soundModalRef = ref()
    const handleSoundModal = (record) => {
      soundModalRef.value?.openImportModal(record)
    }
    const handleEnter = () => {
      tableRef.value.getData()
    }
    const handlePlay = (record) => {
      let url = record?.file?.path ?? ''
      if (url && !url?.includes('http')) {
        url = window.location.origin + url
      }
      if (url.endsWith('.mp3') || url.endsWith('.mp4')) {
        window.open(url)
      } else {
        
      }
    }
    return {
      tableRef,
      ...toRefs(state),
      handleSoundModal,
      soundModalRef,
      handleEnter,
      handlePlay,
      pageTitle
    };
  },
});
</script>
<style lang="less" scoped></style>
