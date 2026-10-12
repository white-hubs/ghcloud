<template lang="pug">
div.tableMessage
  div.modelTitle(v-if="title") {{title}}
  div.occupy(v-if="title")
  div.messageTable
    div.moreButton
      a-button(type="link" @click="showMore") 更多
        DoubleRightOutlined
    a-table(:columns='columns' :data-source='TableData' rowKey='id' :loading="loading"  :pagination="false" :scroll="{ y: 280 }" size="small" )
      template(#msgContent="{text, record}")
        a-popover(:content='text') {{record.msgContent}}
      template(#sourceTenantName="{text, record}")
        a-popover(:content='text') {{record.sourceTenantName}}
      template(#sendTimeText="{text, record}")
        a-popover(:content='text') {{record.sendTimeText}}
      template(#hasReadText="{text, record}")
        a-popover(:content='text') {{record.hasReadText}}
</template>
<script lang='jsx'>
import { DoubleRightOutlined } from "@ant-design/icons-vue";
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted } from "vue";
import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { authStore } from '@/config'
import moment from "moment";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

export default defineComponent({
  props: {
    title: {
      type: String,
      default: () => {
        return "";
      },
    },
    scroll: {
      type: Number,
      default: () => {
        return 150;
      },
    },
  },
  setup() {
    // 使用全局方法
    const router = useRouter();
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      columns: [
        {
          title: "消息内容",
          dataIndex: "msgContent",
          key: "msgContent",
          width: 180,
          ellipsis: true,
          align: 'center',
          slots: {
            customRender: "msgContent",
          },
        },
        {
          title: "所属医院",
          dataIndex: "sourceTenantName",
          key: "sourceTenantName",
          width: 80,
          ellipsis: true,
          align: 'center',
          slots: {
            customRender: "sourceTenantName",
          },
        },
        {
          title: "通知时间",
          dataIndex: "sendTimeText",
          key: "sendTimeText",
          width: 100,
          ellipsis: true,
          align: 'center',
          slots: {
            customRender: "sendTimeText",
          },
        },
        // {
        //   title: "消息状态",
        //   dataIndex: "hasReadText",
        //   key: "hasReadText",
        //   align: 'center',
        //   width: 50,
        //   slots: {
        //     customRender: "hasReadText",
        //   },
        // },
      ],
      TableData: [],
      loading: false,
    });
    const show = () => {
      proxy.$message.success("haha");
    };
    const getTableData = async () => {
      try {
        state.loading = true
        const cubeMessageCenterService = new CubeMessageCenterService(authStore)
        const res = await cubeMessageCenterService.getMsgRecordsPage({
          applicationCode: 'OPERATING_ROOM',
          pageSize: 10,
          pageNumber: 1
        })
        if (res) {
          const { records } = res
          state.TableData = records?.map(item => {
            return {
              ...item,
              msgContent: item.msgContent ?? '--',
              sourceTenantName: item.sourceTenantName ?? '--',
              sendTimeText: item.sendTime ? moment(item.sendTime).format("YYYY-MM-DD HH:mm:ss") : "--",
              hasReadText: item.hasRead ? '已读' : '未读'
            }
          })
        }
      } catch (error) {
        proxy.$message.error(error?.errorMessage ?? '网络异常');
      } finally {
        state.loading = false
      }
    };
    onMounted(() => {
      getTableData();
    });
    const showMore = async () => {
      const ele = {
        "id": "1767358914541953026",
        "code": "OPERATING_ROOM",
        "name": "医疗洁净",
        "icon": "/resource/app-icons/手术示教/main.png",
        "remark": "",
        "enabled": true,
        "sort": null,
        "applicationGroupId": "1772885636550758401",
        "applicationGroupName": "",
        "createTime": 1710206176000,
        "updateTime": 1732246924000,
        "path": "",
        "fileVO": null,
        "menuVOS": [],
        "lastVisitTime": null,
        "alias": ""
      }
      const menu = await proxy.$api.appMenu("get", ele.code);
      if (menu.length) {
        store.commit("menu/SET_MENU", JSON.stringify(menu));
        store.commit("menu/SET_APP", JSON.stringify(ele));
      }
      router.push(`/portal/operating-room-admin-manage/over-limit-record`);
    };
    return {
      ...toRefs(state),
      show,
      getTableData,
      showMore
    };
  },
  components: {
    DoubleRightOutlined,
  },
});
</script>
<style lang="less" scoped>
// @import url("@/styles/theme/color.less");;
.tableMessage {
  height: 100%;
  :deep(.ant-table-column-title) {
    font-family: @fontMedium;
    color: #535b6c;
  }
  :deep(.ant-table-wrapper) {
    width: 100%;
    height: 100%;
  }
}
.modelTitle {
  width: 100%;
  color: #535b6c;
  text-align: left;
  font-size: 16px;
  font-family: @fontMedium;
  padding: 20px 20px 0;
  position: absolute;
  left: 0;
  background-color: @white;
}
.occupy {
  width: 100%;
  height: 60px;
  background: @white;
}
.messageTable {
  height: calc(100% - 60px);
  overflow: hidden;
}
:deep(.ant-table) {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
:deep(.ant-spin-nested-loading) {
  width: 100%;
  height: 100%;
}
:deep(.ant-spin-container) {
  width: 100%;
  height: 100%;
}
:deep(.ant-table-pagination.ant-pagination) {
  position: absolute;
  bottom: 10px;
  right: 10px;
}
.moreButton{
  display: flex;
  align-items: center;
  position: absolute;
  top: 28px;
  right: 10px;
}
</style>
