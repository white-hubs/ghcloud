<template>
  <div class="ctr">
    <g-table :isShowMore="false" :beforeGet="beforeFun" :title="pageTitle" :columns="columns" :btns="btns" :search="search" :api="api" :rules="rules" :rowKey="'id'"
      :scrollX="800">
      <template v-slot:btn="{ record }">
        <a class="action_btn" @click="detail(record)">查看</a>
      </template>
    </g-table>
    <a-modal v-model:visible="visible" title="公告信息" centered>
      <template #footer>
        <a-button @click="close">关闭</a-button>
      </template>
      <a-spin :spinning="spinning">
        <div class="head-box">
          发送人：{{ model?.createBy ? model?.createBy : "--" }} &nbsp;
          通报时间：{{ model?.noticeTime ? model?.noticeTime : "--" }}
        </div>
        <div class="title">{{ model?.title }}</div>
        <div class="content" v-html="model?.content ? model?.content : ''"></div>
        <a-form :model="model">
          <a-form-item label="附件信息">
            <a :href="model.fileList[0].url+'?response-content-type=application/octet-stream'"
              v-if="model.fileList[0]&&model.fileList[0].url.indexOf('.txt')>-1"
              download="model.txt">{{model.fileList[0].name}}</a>
            <a-upload v-else v-model:file-list="model.fileList" disabled></a-upload>
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>
  </div>
</template>

<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
  createVNode,
} from "vue";
import { Modal, message } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  components: {},
  setup() {
    const { proxy } = getCurrentInstance();
    const { pageTitle } = usePageName()

    const state = reactive({
      columns: [
        {
          title: "公告时间",
          dataIndex: "noticeTime",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "公告标题",
          dataIndex: "title",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "公告类型",
          dataIndex: "typeName",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "公告级别",
          dataIndex: "levelName",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "公告人",
          dataIndex: "createBy",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },

        {
          dataIndex: "action",
          title: "操作",
          fixed: "right",
          slots: {
            customRender: "action",
          },
        },
      ],
      api: {
        list: "noticeInfo",
      },
      btns: [],
      search: [
        {
          label: "公告类型",
          value: "type",
          component: "g-select",
          placeholder: "公告类型",
          url: "noticeType",
          field: {
            id: "value",
            typeName: "label",
          },
        },
        {
          label: "公告级别",
          value: "level",
          component: "g-select",
          placeholder: "公告级别",
          url: "noticeLevel",
          field: {
            code: "value",
            name: "label",
          },
        },
        {
          label: "公告时间",
          component: "a-range-picker",
          value: "date",
          defaultDate: "period",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "公告名称",
        },
      ],
      visible: false,
      spinning: false,
      model: {
        fileList: []
      },
    });
    const beforeFun = (e)=>{
      return {
        ...e,
        status:'DISPLAY'
      }
    }
    const detail = (record) => {
      state.spinning = true;
      proxy.$api.noticeInfoId(record.id, "get").then((res) => {
        state.model = res;
        state.model.fileList = res.files.map(item => {
          return {
            name: item.name,
            url: item.path,
            status: 'done',
            uid: item.id,
          }
        })
        state.spinning = false;
        state.visible = true;
      });
    };

    const close = () => {
      state.visible = false;
    };

    return {
      ...toRefs(state),
      detail,
      beforeFun,
      close,
      pageTitle
    };
  },
});
</script>

<style lang="less" scoped>
.ctr {
  width: 100%;
  height: 100%;
}

.title {
  font-size: 18px;
  text-align: center;
  font-weight: 500;
  font-weight: bold;
  padding: 20px 0;
}

.content {
  font-size: 16px;
  text-align: center;
  max-height: 300px;
  overflow-y: scroll;
  overflow-y: overlay;
}

.head-box {
  height: 40px;
  background-color: #fdf9f977;
  text-align: right;
  line-height: 40px;
}
</style>
