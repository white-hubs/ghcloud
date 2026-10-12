<template>
  <g-table ref="tableRef" :title="pageTitle" :columns="columns" :btns="btns" :search="search" :api="api" :editMode="'custom'"
    @operation="openModel" tableCode="broadcastCenterMoban" scrollX="0">
    <template v-slot:beforeBtn="{ record }">
      <a-button type="link" @click="operationRecord(record)">编辑</a-button>

      <a-popconfirm title="删除当前选中？" @confirm="operationDelete(record)">
        <a-button type="link" v-if="!record.defaulted" danger>删除</a-button>
      </a-popconfirm>
    </template>
  </g-table>

  <a-modal v-model:visible="panelVisi" centered width="45%" :title="modalName" @ok="save" @cancel="panelCancel"
    :confirmLoading="panelLoading">
    <a-form ref="panelRef" :model="panelModel" :rules="panelRules">
      <a-form-item label="模板名称" name="name">
        <a-input :maxlength="6" v-model:value="panelModel.name" :placeholder="'请输入模板名称'" :disabled="disabled"></a-input>
      </a-form-item>
      <a-form-item label="内容类型" name="contentType">
        <a-radio-group v-model:value="panelModel.contentType" >
          <a-radio value="TEXT">
            <span>文本</span>
          </a-radio>
          <a-radio value="AUDIO">
            <span >音频</span>
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <div v-if="panelModel.contentType==='TEXT'">
        <a-form-item label="广播变量" name="code">
          <a-radio-group v-model:value="panelModel.code" button-style="solid">
            <a-radio-button :value="'name'">
              <span @click="changeTab('name')">姓名</span>
            </a-radio-button>
            <a-radio-button :value="'address'">
              <span @click="changeTab('address')">地址</span>
            </a-radio-button>
            <a-radio-button :value="'plateNo'">
              <span @click="changeTab('plateNo')">车牌号</span>
            </a-radio-button>
            <a-radio-button :value="'curTime'">
              <span @click="changeTab('curTime')">当前时间</span>
            </a-radio-button>
            <a-radio-button :value="'curDate'">
              <span @click="changeTab('curDate')">当前日期</span>
            </a-radio-button>
            <a-radio-button :value="'phone'">
              <span @click="changeTab('phone')">电话</span>
            </a-radio-button>
            <a-radio-button :value="'genericText'">
              <span @click="changeTab('genericText')">通用文本</span>
            </a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="广播内容" name="content">
          <a-textarea @blur="campaignNameBlur" @keydown.delete.native="del" v-model:value="panelModel.content" :rows="6"
            placeholder="请输入" :maxlength="1000" allowClear showCount />
        </a-form-item>
      </div>
      <div v-else>
        <a-form-item label="广播内容" name="content">
          <a-input v-model:value="panelModel.audioContent" disabled style="width:50%;margin-right:10px"></a-input>
          <span style="color:red" v-show="videoList.length>0" @click="()=>{videoList=[];panelModel.audioContent='';panelModel.audioContentId=''}">删除</span>
          <div style="display:inline-block;width:60px;margin-left:10px">
            <a-upload
              v-model:fileList="videoList"
              name="file"
              :multiple="false"
              :customRequest="customRequest"
              :showUploadList="false"
              :remove="removeFile"
              accept=".mp3,.mp4"
        >
          <a-button type="primary">上传 </a-button>
        </a-upload>
          </div>
          <span style="display:inline-block;margin-left:10px;width:110px;vertical-align:top;font-size: 12px;color:#a0a0a0">支持mp3格式，文件大小不超过5MB</span>
      </a-form-item>
      </div>
    </a-form>
  </a-modal>
</template>

<script lang="jsx">
import {
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  ref,
  getCurrentInstance,
} from "vue";
import moment from "moment";
import { usePageName } from "@ghcloud/cube-utils"
import { cubeFileService } from "@/api/service";

export default defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      // 表头
      columns: [
        {
          dataIndex: "",
          title: "序号",
          width:60,
          align: "center",
          slots: {
            customRender: "",
          },
          customRender: ({ text, index }) => {
            return index + 1;
          },
        },
        {
          title: "模板名称",
          dataIndex: "name",
          key: "name",
          width: 100,
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
          dataIndex: "content",
          key: "content",
          title: "广播内容",
          width:400,
          ellipsis: true,
          customRender: ({ text,record }) => {
            if(record.contentType==='TEXT'){
              return (
              <PopOver
                position="topLeft"
                content={
                  text
                    ? text
                      .replaceAll("${name}", "{ 姓名 }")
                      .replaceAll("${address}", "{ 地址 }")
                      .replaceAll("${plateNo}", "{车牌号 }")
                      .replaceAll("${curTime}", "{当前时间}")
                      .replaceAll("${curDate}", "{当前日期}")
                      .replaceAll("${phone}", "{ 电话 }")
                      .replaceAll("${genericText}", "{ 通用文本 }")
                    : ""
                }
              >
                {text
                  ? text
                    .replaceAll("${name}", "{ 姓名 }")
                    .replaceAll("${address}", "{ 地址 }")
                    .replaceAll("${plateNo}", "{车牌号 }")
                    .replaceAll("${curTime}", "{当前时间}")
                    .replaceAll("${curDate}", "{当前日期}")
                    .replaceAll("${phone}", "{ 电话 }")
                    .replaceAll("${genericText}", "{ 通用文本 }")
                  : "--"}
              </PopOver>
            );
            }else{
              return  <audio
                        src={record.fileVOList && record.fileVOList[0] ? record.fileVOList[0].path : ""}
                        style="max-width: 100%;max-height: 100%;" controls></audio>
            }
            
          },
        },
        {
          dataIndex: "updateByName",
          title: "编辑人",
          width:100,
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
          dataIndex: "updateTime",
          title: "最近编辑时间",
          width:100,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          width:100,
          slots: {
            customRender: "action",
          },
        },
      ],
      // 接口
      api: {
        list: "getbroadcastPage",
        edit: "editType",
        deleteSingle: "deletebroadcast",
      },
      // 操作按钮
      btns: ["add"],
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: " 请输入名称搜索",
        },
        {
          label: "内容类型",
          value: "contentType",
          component:'a-select',
          options:[
            {label:'文本',value:'TEXT'},
            {label:'音频',value:'AUDIO'}
          ],
          placeholder: " 请选择内容类型",
        },
      ],
      modalName: "新增",
      panelVisi: false,
      panelLoading: false,
      disabled: false,
      // 对话框弹窗
      itemId: "",
      panelModel: {
        contentType:"TEXT",
        name: "",
        code: "name",
        content: "",
        audioContent:'',
        audioContentId:''
      },
      cursorPosition: "", //保存光标位置
      videoList:[],
      propList: [
        {
          code: "{ 姓名 }",
        },
        {
          code: "{ 地址 }",
        },
        {
          code: "{车牌号 }",
        },
        {
          code: "{当前时间}",
        },
        {
          code: "{当前日期}",
        },
        {
          code: "{ 电话 }",
        },
        {
          code: "{ 通用文本 }",
        },
      ],

      panelRules: {
        name: [{ required: true, message: "类型名称不能为空" }],
        code: [{ required: true, message: "请选择广播变量" }],
        content: [{ required: true, message: "广播内容不能为空" }],
      },
    });
    const { proxy } = getCurrentInstance();
    const contentBl = ref();
    const panelRef = ref(null);
    const tableRef = ref();
    // 打开弹窗
    const openModel = (type, record) => {
      state.panelVisi = true;
      if (type == "add") {
        state.panelModel.name = "";
        state.panelModel.content = "";
        state.panelModel.audioContent=''
      state.panelModel.audioContentId=''
      state.panelModel.contentType='TEXT'
        state.modalName = "新增";
      } else if (type == "edit") {
        state.modalName = "编辑";
      }
    };
    const operationRecord = record => {
      state.disabled = record.defaulted;
      state.modalName = "编辑";
      state.panelVisi = true;
      state.panelModel.name = record.name;
      state.panelModel.code = "name";
      state.panelModel.content = record.content;
      state.itemId = record.id;
      state.panelModel.content = record.content
        .replaceAll("${name}", "{ 姓名 }")
        .replaceAll("${address}", "{ 地址 }")
        .replaceAll("${plateNo}", "{车牌号 }")
        .replaceAll("${curTime}", "{当前时间}")
        .replaceAll("${curDate}", "{当前日期}")
        .replaceAll("${phone}", "{ 电话 }")
        .replaceAll("${genericText}", "{ 通用文本 }")
      state.panelModel.audioContent=record.fileVOList?.[0]?.name??''
      state.panelModel.audioContentId=record.fileVOList?.[0]?.id??''
      state.panelModel.contentType=record.contentType
      if(state.panelModel.contentType==='AUDIO')state.panelModel.content=''
    };
    const getDeils = record => {
      proxy.$api.getEnterpriseDeils(record.id, "get").then(res => {
        state.panelModel.name = res.name;
      });
    };
    const save = async () => {
      if(state.panelModel.contentType==='TEXT'){
        state.panelModel.content = state.panelModel.content
            .replaceAll("{ 姓名 }", "${name}")
            .replaceAll("{ 地址 }", "${address}")
            .replaceAll("{车牌号 }", "${plateNo}")
            .replaceAll("{当前时间}", "${curTime}")
            .replaceAll("{当前日期}", "${curDate}")
            .replaceAll("{ 电话 }", "${phone}")
            .replaceAll("{ 通用文本 }", "${genericText}");
      }else{
        state.panelModel.content=state.panelModel.audioContentId
      }
      panelRef.value
        .validate()
        .then(() => {
          state.panelLoading = true;
          if (state.modalName == "新增") {
            proxy.$api
              .addbroadcast(state.panelModel )
              .then(() => {
                proxy.$message.success("操作成功");
                tableRef.value.getData();
                panelCancel();
                state.panelLoading = false;
              })
              .catch(() => {
                state.panelLoading = false;
              });
          }
          if (state.modalName == "编辑") {
            proxy.$api
              .editbroadcast(state.itemId, state.panelModel)
              .then(() => {
                proxy.$message.success("操作成功");
                tableRef.value.getData();
                panelCancel();
                state.panelLoading = false;
              })
              .catch(() => {
                state.panelLoading = false;
              });
          }
        })
        .catch(() => { });
    };
    // 失去焦点时保存光标位置
    const campaignNameBlur = e => {
      state.cursorPosition = e.srcElement.selectionStart;
    };
    //上传
    const customRequest = async (data) => {
      if (data.file.size / 1024 > 1024 * 500) {
        proxy.$message.warn('附件上传大小不能超过500MB')
        return
      }
      const res = await cubeFileService.uploadFile({
        businessKey: 'broadcast',
        file: data.file
      })
      state.videoList = [{
        uid: res.id,
        name: res.name,
        status: 'success',
        path: res.path
      }]
      state.panelModel.audioContent=res.name
      state.panelModel.audioContentId=res.id
    }
    const removeFile = async (file) => {
      return true;
    }
    // 具体位置插入变量
    const changeTab = e => {
      const value = e;
      var val = null;

      switch (value) {
        case "name":
          val = "{ 姓名 }";
          break;
        case "address":
          val = "{ 地址 }";
          break;
        case "plateNo":
          val = "{车牌号 }";
          break;
        case "curTime":
          val = "{当前时间}";
          break;
        case "curDate":
          val = "{当前日期}";
          break;
        case "phone":
          val = "{ 电话 }";
          break;
        case "genericText":
          val = "{ 通用文本 }";
          break;
        default:
          break;
      }
      let num = state.cursorPosition;
      let type = typeof num;
      let cont = state.panelModel.content;
      if (type == "number") {
        //插入到指定光标处
        let right = cont.slice(0, num);
        let left = cont.slice(num);
        state.panelModel.content = right + val + left;
      } else {
        //没有指定插入直接添加到最后
        state.panelModel.content = state.panelModel.content + val;
      }
    };
    const del = e => {
      let content = state.panelModel.content;
      if (!content) return;
      let start = e.target.selectionStart; //光标起始位置
      let end = e.target.selectionEnd; //光标结束位置
      if (start == end) {
        //删除暂时所有的变量字符串长度为6，这样可以统一长度光标删除提示，
        let left = content.slice(end - 6, end);
        let right = content.slice(end - 1, end + 6 - 1);
        let arr = state.propList.map(item => item.code);
        if (arr.includes(left)) {
          e.target.setSelectionRange(end - 6, end); //设置光标位置
          e.preventDefault(); //阻止浏览器的默认行为，防止删除
        } else if (arr.includes(right)) {
          e.target.setSelectionRange(end - 1, end + 6 - 1);
          e.preventDefault();
        }
      }
    };

    const operationDelete = record => {
      proxy.$api.deletebroadcast(record).then(() => {
        proxy.$message.success("操作成功");
        tableRef.value.getData();
      });
    };
    const panelCancel = () => {
      panelRef.value.resetFields();

      state.panelVisi = false;
    };
    onMounted(() => { });

    return {
      ...toRefs(state),
      openModel,
      panelCancel,
      save,
      panelRef,
      tableRef,
      getDeils,
      operationRecord,
      changeTab,
      contentBl,
      campaignNameBlur,
      del,
      operationDelete,
      customRequest,
      removeFile
    };
  },
});
</script>

<style scoped lang="less">
:deep(.ant-radio-button-wrapper) {
  margin-right: 20px;
}
</style>
