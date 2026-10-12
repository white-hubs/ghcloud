<template>
  <g-layout
    :title="`${
      type === 'add' ? '新增' : type === 'edit' ? '修改' : '详情'
    }公告管理`"
  >
    <template #content-table>
      <g-detail-form-private
        :api="api"
        :formList="formList"
        :rules="rules"
        ref="detailFormRef"
        :afterGet="afterGet"
      >
        <template #content>
          <g-edit @getHtml="getHtml" v-if="type !== 'detail'"></g-edit>
        </template>
        <template #fileIds="{ record }">
          <g-upload
            :file="fileList"
            :sceneCode="GLOBAL_SCENE_CODE.technicalBulletin"
            accept=""
            :size="10"
            :max="50"
            @changeFile="changeFile"
            v-if="type !== 'detail'"
          ></g-upload>
        </template>
        <template #edit-item>
          <a-form-item class="a-form-item-100" label="公告人员">
            <MessageModule
              :actionConfig="actionConfig"
              ref="MessageModuleRef"
            ></MessageModule>
            <span v-if="actionConfig.length===0 && type === 'detail'">--</span>
          </a-form-item>
          <a-form-item
            class="a-form-item-100"
            label="公告记录"
            v-if="type === 'detail'"
          >
            <a-table
              :columns="columns"
              :dataSource="dataSource"
              size="small"
            ></a-table>
          </a-form-item>
        </template>
      </g-detail-form-private>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <a-button
        type="primary"
        @click="submit"
        v-if="type !== 'detail'"
        :loading="loading"
      >
        保存
      </a-button>
    </template>
  </g-layout>
</template>

<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import { timeFormat } from "@/utils/common";
import { useRouter, useRoute } from "vue-router";
import MessageModule from "./component/messageModule.vue";
import gDetailFormPrivate from "./component/gDetailFormPrivate.vue";
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
export default defineComponent({
  components: {
    MessageModule,
    gDetailFormPrivate,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const { type } = route.query;
    const messageNotify = ref();
    const detailFormRef = ref();
    const MessageModuleRef = ref();
    const state = reactive({
      api: {
        detail: "noticeInfoId",
      },
      formList: [
        {
          title: "基础信息",
          form: [
            { label: "公告标题", value: "title" ,maxlength:128},
            {
              label: "公告类别",
              value: "type",
              detailValue: "typeName",
              component: "a-cascader",
              url: "noticeType",
              options: [],
              placeholder:'请选择'
            },
            {
              label: "公告级别",
              value: "level",
              detailValue: "levelName",
              component: "g-select",
              url: "noticeLevel",
              field: {
                code: "value",
                name: "label",
              },
               placeholder:'请选择'
            },
            {
              label: "公告标签",
              value: "tagId",
              detailValue: "tagName",
              component: "g-select",
              url: "noticeLabel",
              field: {
                id: "value",
                typeName: "label",
              },
               placeholder:'请选择'
            },
            {
              label: "发布机构",
              value: "publishAgency",
              detailValue: "publishAgency",
              component: "g-select",
              url: "noticeInstitution",
              field: {
                id: "value",
                typeName: "label",
              },
               placeholder:'请选择'
            },
            {
              label: "公告内容",
              value: "content",
              slot: true,
              singleLine: true,
              html: true,
              detailFun: (value) => {
                return value;
              },
            },
            {
              label: "附件信息",
              value: "fileIds",
              slot: true,
              component: "a-upload",
              detailValue: "files",
            },
          ],
        },
      ],

      rules: {
        title: [{ required: true, message: "请输入公告标题" }],
        type: [{ required: true, message: "请选择公告类型" }],
        level: [{ required: true, message: "请选择公告级别" }],
        content: [{ required: true, message: "请填写公告内容" }],
      },
      fileList: [],
      actionConfig: [],
      model: {},
      columns: [
        {
          title: "公告时间",
          dataIndex: "sendTime",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "公告人",
          dataIndex: "userName",
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
          title: "公告结果",
          dataIndex: "sendStatusDesc",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
      ],
      dataSource: [],
      loading: false,
    });

    const getHtml = (value) => {
      detailFormRef.value.form.content = value;
      detailFormRef.value.formValItem("content");
    };

    const goBack = () => {
      history.go(-1)
    };
    const changeFile = (e)=>{
      state.fileList = [...new Set(e)]  
    }
    const submit = () => {
      detailFormRef.value.formRef
        .validate().then(()=>{
        let msg = null
      MessageModuleRef.value.setList.forEach(item=>{
        if(item.way.length===0){
          msg = '请选择通知方式'
        }
        if(!item.deptIds && !item.postIds && !item.roleIds && !item.userIds){
          msg = '请选择通知人员'
        }
      })
      if (!msg) {
        const setList = JSON.parse(JSON.stringify(MessageModuleRef.value.setList))
        const noticeConfigCommands = setList.map(
          (item) => {
            item.way = item.way.length ? item.way.join(",") : "";
            return {
              ...item,
              deptIds:item.deptIds.map(e=>e.id),
              postIds:item.postIds.map(e=>e.id),
              roleIds:item.roleIds.map(e=>e.id),
              userIds:item.userIds.map(e=>e.id)
            }
          }
        );
        const params = {
          ...detailFormRef.value.form,
          noticeConfigCommands,
          fileIds:state.fileList,
          type:detailFormRef.value.form.type[1]
        };
        state.loading = true;
        proxy.$api
          .noticeInfoAdd(params, "post")
          .then(() => {
            proxy.$message.success("操作成功");
            goBack();
          })
          .finally(() => {
            state.loading = false;
          });
      }else{
        proxy.$message.warn(msg);
      }
      });
      
    };

    const getTable = (id) => {
      proxy.$api.getMsgRecordTargets({ businessKey: id }, "get").then((res) => {
        if (res.length > 0) state.dataSource = res;
      });
    };

    const afterGet = (form) => {
      state.model = form;
      state.actionConfig = form.noticeConfigs.filter((item) => {
        item.way =
          typeof item.way === "string"
            ? item.way.split(",")
            : item.way instanceof Array
            ? item.way
            : [];
        return item;
      });
      getTable(form.id);
      return form;
    };
    const getNoticeType = ()=>{
      proxy.$api
          .noticeType({pageNumber: 1,pageSize: 100})
          .then((res) => {
            const news = res.filter(e=>e.oneLevelType === "NEW_INFORMATION").map(e=>{
              return {value:e.id,label:e.typeName,...e}
            })
            const notice = res.filter(e=>e.oneLevelType === "ANNOUNCEMENT").map(e=>{
              return {value:e.id,label:e.typeName,...e}
            })
            const arr = [
              {
                value: 'ANNOUNCEMENT',
                label: '通知公告',
                children:notice
              },
              {
                value: 'NEW_INFORMATION',
                label: '新闻资讯',
                children:news
              },
            ]
            state.formList[0].form[1].options = arr
          })
    }
    onMounted(() => {
      getNoticeType()
    });

    return {
      type,
      messageNotify,
      detailFormRef,
      MessageModuleRef,
      ...toRefs(state),
      afterGet,
      getHtml,
      submit,
      goBack,
      changeFile,
      GLOBAL_SCENE_CODE
    };
  },
});
</script>

<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");
:deep(.detail-form) {
  .topLine {
    width: 100%;
    border-bottom: 1px solid #e8e8e88c;
  }
  .sub > .add-row > span {
    font-size: 16px;
    font-weight: 500;
  }
}
:deep(.ant-image) {
  img {
    width: 100%;
    height: 100%;
  }
}
</style>
<style lang="less">
#editorcontent{
  // max-width: 1550px;
  width: calc(100% - 16px);
}
</style>