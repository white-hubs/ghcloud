<template lang="pug">
g-layout-no-footer(title="实时监控")  
  template(#content-left)
    div.content_left.pr2
      Tree(
        ref="treeRef"
        :url="'laneTree'" 
        v-model:value="treeSearch" 
        :placeholder="'请选择设备类型'" 
        :fieldNames="fieldNames" 
        :mode="false"
        :lastLevel="false"
        @get-all="select"
        :isSelect="true"
        :selectCondition="'deviceId'")
  template(#content-table)
    div.monitorVideo_control.mb1.flex.justify-between 
      div
        a-space(:size="16")
          span.space
            a-button(:type="space === 1 ? 'primary' : 'default' " @click="spaceType(1)") 1X1
            a-button(:type="space === 4 ? 'primary' : 'default' " @click="spaceType(4)") 2X2
            a-button(:type="space === 9 ? 'primary' : 'default' " @click="spaceType(9)") 3X3
            a-button(:type="space === 16 ? 'primary' : 'default' " @click="spaceType(16)") 4X4
      div 
        a-space(:size="16")
          a-button
            template(#icon)
              //- 退出全屏
              FullscreenExitOutlined(v-if="isFullScreen" @click="fullScreen('close')")
              //- 打开全屏
              FullscreenOutlined(v-else @click="fullScreen('open')")
    div.videoPlayPart(ref="monitor_video")
      monitorVideo(ref="monitorVideo" :videoList="videoList" :selectedSpace="selectedSpace" @checkbox="checkBoxIndex" @deleteItem="deleteItem")
</template>
<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  createVNode,
  onMounted,
  reactive,
  toRefs,
  watch,
  ref,
} from "vue";
// import monitorVideo from "./components/monitorVideo.vue";
import monitorVideo from "./components/monitorVideo.vue";
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";
import _ from "lodash";
export default defineComponent({
  components: {
    monitorVideo,
    FullscreenOutlined,
    FullscreenExitOutlined,
    DeleteOutlined,
    EditOutlined,
  },
  setup() {
    const { proxy } = getCurrentInstance();

    const monitorVideo = ref();

    const state = reactive({
      videoList: [null, null, null, null],
      space: 4,
      selectedSpace: {
        label: "2X2",
        value: 4,
      },
      model: {
        id: "",
        name: "",
      },
      rules: {
        name: [{ required: true, message: "请输入收藏名称" }],
      },
      selectedKeys: [],
      fieldNames: {
        children: "children",
        label: "name",
        key: "id",
      },
      isFullScreen: false,
      collectList: [],
      checkBoxIndex: null,
    });
    const treeRef = ref();
    const visible = ref(false);
    const monitor_video = ref();
    const treeSearch = ref("");

    const spaceType = async (num) => {
      let arr;
      state.space = num;
      state.checkBoxIndex =
        state.checkBoxIndex > num - 1
          ? monitorVideo.value.checkBox(null)
          : state.checkBoxIndex;
      if (num === 1) {
        state.selectedSpace = {
          label: "1X1",
          value: 1,
        };
        if (state.videoList.length > 1) {
          state.videoList.splice(1);
          state.selectedKeys.splice(1);
          treeRef.value.changeSelected(state.selectedKeys);
        }
      } else if (num === 4) {
        state.selectedSpace = {
          label: "2X2",
          value: 4,
        };
        if (state.videoList.length < 4) {
          arr = await new Array(4 - state.videoList.length).fill(null);
          state.videoList = _.concat(state.videoList, arr);
        } else {
          state.videoList.splice(4);
          state.selectedKeys.splice(4);
        }
      } else if (num === 9) {
        state.selectedSpace = {
          label: "3X3",
          value: 9,
        };
        if (state.videoList.length < 9) {
          arr = await new Array(9 - state.videoList.length).fill(null);
          state.videoList = _.concat(state.videoList, arr);
        } else {
          state.videoList.splice(9);
          state.selectedKeys.splice(9);
        }
      } else if (num === 16) {
        state.selectedSpace = {
          label: "4X4",
          value: 16,
        };
        if (state.videoList.length < 16) {
          arr = await new Array(16 - state.videoList.length).fill(null);
          state.videoList = _.concat(state.videoList, arr);
        } else {
          state.videoList.splice(16);
          state.selectedKeys.splice(16);
        }
      } else if (num === 25) {
        state.selectedSpace = {
          label: "5X5",
          value: 25,
        };
      }
    };

    const fullScreen = (status) => {
      const element = monitor_video.value;
      if (status === "open") {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullScreen();
        }
      }
    };

    const select = async (selectedKeys, selected, selectedNodes, node) => {
      state.selectedKeys = selectedKeys;
      const n = selectedNodes?.[0] ?? node
      const dataRow = n?.dataRef ?? n
      if (selected) {
        if (!dataRow.token) {
          proxy.$message.warn("当前设备暂无token,请先绑定token");
          return;
        }
        // 当前选中的设备已经在播放了
        const checkedEquipToken = await state.videoList.map(
          (item) => item?.Token
        );
        if (checkedEquipToken.includes(dataRow.token)) {
          proxy.$message.warn("当前设备正在播放");
          return;
        }

        // 已选了播放框
        if (state.checkBoxIndex || state.checkBoxIndex === 0) {
          state.videoList[state.checkBoxIndex] = {
            name: dataRow.name,
            ServerAgree:
              dataRow.steamMediaIpAddress.split("://")[0],
            ServerIp:
              dataRow.steamMediaIpAddress.split("://")[1],
            Token: dataRow.token,
            deviceId: dataRow.id,
            sort: state.checkBoxIndex,
          };
        } else {
          // 查询符合条件的第一条数据
          const index = await state.videoList.findIndex(
            (item) => item === null
          );
          // 替换当前最后一个监控--当前数组中没有占位空数据--替换最后一个
          if (index === -1) {
            state.videoList.splice(0, 1, {
              name: dataRow.name,
              ServerAgree:
                dataRow.steamMediaIpAddress.split("://")[0],
              ServerIp:
                dataRow.steamMediaIpAddress.split("://")[1],
              Token: dataRow?.token,
              deviceId: dataRow?.deviceId,
              sort: index + 1,
            });
          } else {
            state.videoList.splice(index, 1, {
              name: dataRow.name,
              ServerAgree:
                dataRow.steamMediaIpAddress.split("://")[0],
              ServerIp:
                dataRow.steamMediaIpAddress.split("://")[1],
              Token: dataRow?.token,
              deviceId: dataRow?.deviceId,
              sort: index + 1,
            });
          }
        }
      } else {
        const index = state.videoList.findIndex(
          (item) => item.deviceId === dataRow?.deviceId
        );
        state.videoList.splice(index, 1, null);
      }
    };

    const searchTree = () => {};

    const checkBoxIndex = (index) => {
      state.checkBoxIndex = index;
    };

    const deleteItem = (index) => {
      state.videoList.splice(index, 1, null);
    };

    const control = () => {
      if (state.checkBoxIndex || state.checkBoxIndex === 0) {
      } else {
        proxy.$message.error("请先选择控制设备");
      }
    };

    onMounted(() => {
      // 窗口变化--全屏变化
      window.addEventListener("resize", function (e) {
        state.isFull = e?.path[0]?.document?.fullscreen;
      });
    });

    return {
      visible,
      treeRef,
      treeSearch,
      monitorVideo,
      monitor_video,
      ...toRefs(state),
      checkBoxIndex,
      fullScreen,
      searchTree,
      deleteItem,
      spaceType,
      control,
      select,
    };
  },
});
</script>
<style lang="less" scoped>
.content_left {
  width: 300px;
  height: 100%;
  text-align: left;
  // :deep(.ant-empty) {
  //   max-width: 200px;
  // }
  :deep(.ant-tabs-tabpane-active) {
    height: 100%;
    .searchCtr {
      height: 96px;
    }
    .ant-tree {
      padding-top: 16px;
      height: calc(100% - 96px);
      overflow-y: auto;
      .ant-tree-switcher {
        display: none;
      }
      .ant-tree-node-content-wrapper {
        display: inline-block;
        width: calc(100% - 24px);
        vertical-align: middle;
        .ant-tree-title {
          display: inline-block;
          width: 100%;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
    }
  }
}

.monitorVideo_control {
  text-align: left;
  width: 100%;
  height: 46px;
  padding: 0 8px;
  align-items: center;
  background-color: #f3f3f3;
  .space {
    :deep(.ant-btn) {
      border-radius: 0px;
    }
  }
  .progress {
    :deep(.ant-btn) {
      display: flex;
      align-items: center;
      span {
        flex: 1;
        padding-top: 2px;
        display: inline-block;
      }
    }
  }
}
.videoPlayPart {
  width: 100%;
  height: calc(100% - 55px);
}
ul {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  li {
    width: 100%;
    height: 32px;
    line-height: 32px;
    cursor: pointer;
    .collectName {
      width: 80%;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
    .IconOperate {
      width: 20%;
    }
  }
}
</style>
