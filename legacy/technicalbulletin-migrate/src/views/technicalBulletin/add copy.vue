<template>
  <g-layout
    :title="`${
      type === 'add' ? '新增' : type === 'edit' ? '修改' : '详情'
    }公告管理`"
  >
    <template v-slot:content-table>
      <a-form ref="form" :model="model">
        <a-form-item label="公告标题" name="topic" class="form-item">
          <a-input
            v-model:value="model.topic"
            placeholder="请输入巡检计划名称"
          ></a-input>
        </a-form-item>
        <a-form-item label="公告说明" name="textarea" class="form-item">
          <a-card t :bodyStyle="{ padding: '0' }">
            <template v-slot:title> </template>
            <a-textarea
              v-model:value="model.textarea"
              placeholder="请输入公告说明"
              :maxlength="200"
              :rows="2"
            />
          </a-card>
        </a-form-item>
        <!-- 文件上传 -->
        <a-form-item label="附件信息" name="file" class="form-item">
          <a-upload
            v-model:file-list="fileList"
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          >
            <a-button>
              <upload-outlined></upload-outlined>
              Upload
            </a-button>
          </a-upload>
        </a-form-item>
        <a-form-item
          label="通知人员"
          name="topic"
          class="form-item"
          v-for="item in noticeModeArr"
          :key="item.id"
        >
          <gSelect
            class="pl1"
            v-model:value="model.DepAndMenber"
            style="width: 30%"
            :url="'deptList'"
            placeholder="请选择人员"
          >
            <!-- url是接口 -->
          </gSelect>
          <gSelect
            class="pl1"
            v-model:value="model.noticeMode"
            style="width: 30%"
            :url="'deptList'"
            placeholder="请选择通知方式"
          >
          </gSelect>
          <gSelect
            class="pl1"
            v-model:value="model.member"
            style="width: 30%"
            :url="'deptList'"
            placeholder="请选择具体人员"
          >
          </gSelect>
          <a-button
            shape="circle"
            class="form-item-but"
            @click="reduceNoticeMode(item.id)"
            v-if="noticeModeArr.length > 1"
          >
            <template #icon><minus-outlined /></template>
            <!-- 去掉 -->
          </a-button>
          <a-button shape="circle" class="form-item-but" @click="addNoticeMode">
            <template #icon><plus-outlined /></template>
            <!-- 新增 -->
          </a-button>
        </a-form-item>
      </a-form>
    </template>
    <template v-slot:footer-page>
      <a-button type="primary">保存</a-button>
      <a-button>取消</a-button>
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
  createVNode,
  ref,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { Modal, message } from "ant-design-vue";
import { UploadOutlined } from "@ant-design/icons-vue";
export default defineComponent({
  components: {},
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const { type } = route.query;
    const state = reactive({
      model: {
        topic: "",
        textarea: "",
        DepAndMenber: "", //选择部门还是人员
        noticeMode: "", //通知方式
        member: "", //具体的人员或者那个部门
      },
      noticeModeArr: [],
    });
    onMounted(function(){});
    //点击新增的时候 增加一栏
    return {
      type,
      ...toRefs(state),
    };
  },
});
</script>

<style lang="less" scoped>
.form-item {
  margin-right: 50px;
  .form-item-but {
    margin: 0 10px;
  }
}
</style>
