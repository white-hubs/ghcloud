<template>
  <Teleport to="body">
  <div class="alarmDetail-wrap">
    <div class="alarmDetail-modal" ref="modalRef">
      <div class="alarmDetail-modal-header" @mousedown="startDrag">
        <div class="header-title">{{ infoData.name }}</div>
        <div class="flex-between">
          <div class="header-close" @click="backModal">
            <fullscreen-exit-outlined />
          </div>
          <div class="header-close" @click="closeModal">
            <CloseOutlined />
          </div>
        </div>
      </div>
      <div class="alarmDetail-modal-content flex-column">
        <div class="content-tabs">
          <div v-for="item in tabsList" :key="item" class="active">
            <div>{{ item }}</div>
          </div>
        </div>
        <div class="conent-body">
          <div style="width: 40%">
            <div class="info-name">设备编码: <span>{{ stallData.code||'--' }}</span></div>
            <div class="info-name">档主名称: <span>{{ stallData.masterName||'--' }}</span></div>
            <div class="info-name">档位类型: <span>{{ stallData.typeName||'--' }}</span></div>
            <div class="info-name">具体位置: <span>{{ stallData.location||'--' }}</span></div>
            <div class="info-name">实用面积: <span>{{ stallData.practicalArea }}㎡</span></div>
            <div class="info-name">出租属性: <span>{{ stallData.leaseType?'可租':'不可租' }}</span></div>
            <div class="info-name" :title="stallData.remark || ''">备注说明: <span>{{ stallData.remark||'--' }}</span></div>
          </div>
          <div style="width: 40%">
            <div class="info-name" :title="stallData.name || ''">档位名称: <span>{{ stallData.name||'--' }}</span></div>
            <div class="info-name">档主联系方式: <span>{{ stallData.masterPhone||'--' }}</span></div>
            <div class="info-name">所在区域: <span>{{ stallData.areaNames.toString()||'--' }}</span></div>
            <div class="info-name">建筑面积: <span>{{ stallData.builtUpArea||'--' }}㎡</span></div>
            <div class="info-name">所属部门: <span>{{ stallData.deptNames.toString() }}</span></div>
            <div class="info-name">档位状态: <span>{{ stallData.enabled?'启用':'禁用' }}</span></div>
            <div class="info-name">附件: <a-image :key="item.id" :src="item.path" alt=""
                v-for="item in stallData.files" /></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</Teleport>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import { CloseOutlined,FullscreenExitOutlined} from "@ant-design/icons-vue";
import { stallDetailId, stallDetailVisualization } from '@/api/mdata'
import { useDragPosition } from "@/hooks/use-drag-position";

const props = defineProps({
  id: {
    type: [String],
    default: "",
  },
  code: {
    type: [String],
    default: "",
  },
  isequ: {
    type: Boolean,
    default: false,
  },
  PanelName: {
    type: Object,
    default: false,
  },
});
const emit = defineEmits(["close"]);
const tabsList = ref(["基本信息"]);
const stallData = ref({
  files:[{id:'',path:''}],
  code:'',
  masterName:'',
  typeName:'',
  location:'',
  practicalArea:'',
  leaseType:'',
  remark:'',
  name:'',
  masterPhone:'',
  areaNames:'',
  builtUpArea:'',
  enabled:'',
  deptNames:'',
})
const infoData = ref({
  name:'档位信息'
});
const modalRef = ref<HTMLElement | null>(null);
const { startDrag } = useDragPosition(modalRef);
const backModal = () => {
  emit("close", false);
}
const closeModal = () => {
 emit("close", true);
};
const getStallDetail = async () => {
 if(props.id){
    stallData.value = await stallDetailId(props.id)
  }else if (props.code) {
    stallData.value = await stallDetailVisualization(props.code)
  }
}
onMounted(()=>{
  getStallDetail()
})
</script>
<style lang="less" scoped>
.alarmDetail-wrap {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 9000;
}

.alarmDetail-modal {
  width: 800px;
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 99999999;
  transform: translate(-50%, -50%);
  background: transparent;
  border-bottom: 2px solid rgba(41, 137, 255, 1);

  &.full {
    width: 100%;
    height: 100%;
  }

  .alarmDetail-modal-header {
    height: 30px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid rgba(41, 137, 255, 1);
    background-image: url('/resource/v1/ue5-migrate/assets/images/modal-title.png');
    background-size: 100%95%;
    background-repeat: no-repeat;

    .header-title {
      font-size: 14px;
      font-weight: 400;
      color: #FFFFFF
    }

    .header-close {
      width: 24px;
      height: 24px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      span {
        font-size: 13px;
      }
    }
    cursor: move;
    &:active {
      cursor: move;
    }
  }

  .alarmDetail-modal-content {
    max-height: 515px;
    width: 100%;
    padding: 0 16px;
    padding-bottom: 20px;
    overflow: hidden;
    background: rgba(1, 11, 23, 0.78);
    margin-top: 2px;

    .content-tabs {
      height: 55px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: 14px;
      font-family: PingFang SC-Regular;
      font-weight: 400;
      color: #ffffff;

      >div {
        width: 68px;
        height: 26px;
        opacity: 1;
        margin-right: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 500;
        color: #FFFFFF;
        cursor: pointer;
        transition: all 0.3s ease-in-out;

        &.active {
          background: linear-gradient(180deg, rgba(41, 137, 255, 0) 0%, rgba(41, 137, 255, 0.5) 100%);
        }
      }
    }

    .conent-body {
      min-height: 340px;
      display: flex;
      justify-content: center;
      font-size: 14px;
      width: 100%;

      :deep(.box .content) {
        margin-top: 15%;
      }

      .info-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 15px;
        color: #B7C5D3;
        text-align: left;
      }

      .info-name>span {
        margin-left: 10px
      }
    }
  }
}

.content-tabs {
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 14px;
  font-family: PingFang SC-Regular;
  font-weight: 400;
  color: #ffffff;

  >div {
    width: 68px;
    height: 26px;
    opacity: 1;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;
    color: #FFFFFF;
    cursor: pointer;
    transition: all 0.3s ease-in-out;

    &.active {
      background: linear-gradient(180deg, rgba(41, 137, 255, 0) 0%, rgba(41, 137, 255, 0.5) 100%);
    }
  }
}
</style>
