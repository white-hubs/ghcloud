<template>
  <div class="alarmDetail-info">
    <div class="info-item">
      <div class="info-item-title">
        <div class="title-icon"></div>
        <div class="title-text">基本信息</div>
      </div>
      <div class="info-item-form">
        <div class="form-item">
          <div class="form-item-label">小散工程名称:</div>
          <div class="form-item-content">{{ state.formState.projectName || "--" }}</div>
        </div>
        <div class="form-item">
          <div class="form-item-label">工程类型:</div>
          <div class="form-item-content">{{ state.formState.projectTypeName || "--" }}</div>
        </div>
        <div class="form-item">
          <div class="form-item-label">工程时间:</div>
            <div class="form-item-content">{{ state.formState.completionTime ? dayjs(state.formState.completionTime).format('YYYY-MM-DD HH:mm') : '--' }}</div>
        </div>
        <div class="form-item">
          <div class="form-item-label">施工地点:</div>
          <div class="form-item-content">
            {{ state.formState.constructionSite || "--" }}
          </div>
        </div>
        <div class="form-item">
          <div class="form-item-label">施工方:</div>
          <div class="form-item-content">
            {{ state.formState.partyB || "--" }}
          </div>
        </div>
        <div class="form-item">
          <div class="form-item-label">负责人:</div>
          <div class="form-item-content" style="color: #ff9737">{{ userNames || "--" }}</div>
        </div>
        <div class="form-item">
          <div class="form-item-label">负责部门:</div>
          <div class="form-item-content" style="color: #ff9737">
            {{ state.formState.superviseDepName || "--" }}
          </div>
        </div>
        <div class="form-item">
          <div class="form-item-label">备注:</div>
          <div class="form-item-content">
            {{ state.formState.remarks || '--' }}
          </div>
        </div>
        <div class="form-item" style="width: 100%;">
          <div class="form-item-label">工程详细资料:</div>
          <div class="info-item-form">
            <div v-if="!state.formState.projectFiles" style="color: #fff">无</div>
            <a-image-preview-group v-if="imageList.length > 0">
              <div class="form-imgs">
                <a-image v-for="item in imageList" :key="item.id" :src="httpImgUrl(item.path)"  style='width:60px; margin: 10px;' ></a-image>
              </div>
            </a-image-preview-group>
            <div class="form-imgs" v-if="fileList.length > 0">
              <div style='margin-right: 10px;text-align: center;color: #e2e2e2;' v-for="item in fileList" :key="item.id" @click="preview(item) ">
                <a-image height="30px" :preview="false" :src="getSnImage('jl.png')" ></a-image>
                <div class='file-name'>{{ item.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="info-item" style="border-bottom: none;">
      <div class="info-item-title">
        <div class="title-icon"></div>
        <div class="title-text">工程进度</div>
      </div>
      <project-progress :dataSource="state.progress"></project-progress>
    </div>
    <div class="info-item" style="border-bottom: none;">
      <div class="info-item-title">
        <div class="title-icon"></div>
        <div class="title-text">工程结果</div>
      </div>
      <project-result :dataSource="state.result"></project-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, computed, watch } from "vue";
import { scheduleDetail, getFeedbackByScheduleId } from "@/api/snMarket";
import { getSnImage } from "@/utils/getImage";
import { message } from "ant-design-vue";
import projectProgress from "./progress.vue";
import projectResult from "./result.vue";
import { kkFilePreview } from '@ghcloud/cube-utils'
import dayjs from "dayjs";
import { isHttpUrl, fallback } from "@/utils/common";

interface Props{
  id: string;
  businessKey: string;
  auth: Record<string, any> | null;
}
const props = withDefaults(defineProps<Props>(), {
  id: "",
  businessKey: "",
  auth: null
});
const state = reactive({
  progress: [],
  result: [],
  formState: {
    projectName: '',
    projectTypeName: '',
    typeId: '',
    partyB: '',
    completionTime: '',
    superviseDepName: '',
    constructionSite: '',
    superviseUser: [],
    remarks: '',
    projectFiles: []
  },
});
const userNames = computed(() => {
  return state.formState?.superviseUser.map(item => item.name).join(',')
})
const typeList = ['doc', 'docx', 'excel', 'xlsx', 'xls', 'pdf', 'ppt', 'txt']
const imageList = computed(() => {
  return state.formState?.projectFiles.filter(item => !typeList.includes(item.type))
})
const fileList = computed(() => {
  return state.formState?.projectFiles.filter(item => typeList.includes(item.type))
})
watch(
  () => props.auth,
  async () => {
    if (props.auth) {
      getData()
      getProgressList()
    }
  },
  { deep: true, immediate: true }
);
const getData = () => {
  if (!props.id) return
  scheduleDetail({id: props.id}).then((res) => {
    state.formState = {
      ...res
    }
  }).catch((error) => {
    message.destroy()
    message.error({
      content: error,
      style: {
        position: "fixed",
        zIndex: 1000,
        top: `10%`,
        left: '46%'
      }
    })
  });
};
const preview = (item): void => {
  if (typeList.includes(item.type ?? '')) {
    const path = httpImgUrl(item.path)
    kkFilePreview({
      ...item,
      path: path
    })
  }
}
const getProgressList = async (): Promise<void> => {
  if (!props.id) return
  const data = await getFeedbackByScheduleId({id: props.id})
  state.progress = data?.filter(item => item.operationCode === 'FEEDBACK') || []
  state.result = data?.filter(item => item.operationCode === 'CHECK_ACCEPT') || []
}
const httpImgUrl = (path) => {
  let url = ''
  const baseUrl = sessionStorage.getItem("market-baseUrl");
  if(!isHttpUrl(path)){
    url = baseUrl + path
  }else{
    url = path
  }
  return url
}
const handleImageError = (event) => {
  const img = event.target;
  img.src = fallback;
};
</script>

<style lang="less" scoped>
.alarmDetail-info {
  font-size: 16px;
  .info-item {
    border-bottom: 1px #394254 dashed;
    padding-bottom: 4px;
    margin-bottom: 16px;

    &:last-child {
      border-bottom: none;
    }

    .info-item-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      margin-bottom: 16px;

      .title-text {
        font-size: 14px;
        font-family: PingFang SC-Medium;
        font-weight: 500;
        color: #ffffff;
      }

      .title-icon {
        width: 14px;
        height: 14px;
        background: rgba(41, 137, 255, 0.5);
        border-radius: 50%;
        position: relative;
        margin-right: 4px;

        &::before {
          content: "";
          position: absolute;
          width: 8px;
          height: 8px;
          background: #2989ff;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }

    .info-item-form {
      display: flex;
      flex-wrap: wrap;

      .form-item {
        display: flex;
        width: 33.33%;
        line-height: 14px;
        color: #fff;
        font-size: 14px;
        margin-bottom: 12px;
        padding-left: 18px;
        align-items: baseline;
        .ellipsis {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        >div {
          display: inline-block;

          &.form-item-label {
            width: auto;
            height: 20px;
            text-align: left;
            vertical-align: top;
            margin-right: 5px;
            white-space: nowrap;
          }

          &.form-item-content {
            width: calc(100% - 70px);
            color: rgba(226, 226, 226, 1);
            line-height: 20px;
          }
        }
      }
      .form-imgs{
        display: flex;
      }

      .form-image {
        width: 60px;
        height: 60px;
        background: wheat;
        margin-right: 8px;
        display: inline-block;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}

</style>
