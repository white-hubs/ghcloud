<template>
  <div class="content">
    <a-form>
      <a-form-item label="广播模板">
        <div class="list-container">
          <div class="list" :class="collapse ? 'open' : 'away'">
            <div class="tag" :class="currentTag?.id === item.id ? 'selected' : ''" v-for="item in broadcastTemplate"
              :key="item.id" @click="changeTemplate(item)">
              {{ item.name }}
            </div>
          </div>
          <div class="collapse" v-if="broadcastTemplate.length > 6" @click="clickCollapse">
            <div v-if="!collapse">
              <span>展开</span>
              <DownOutlined style="color: #2989ff"></DownOutlined>
            </div>
            <div v-else>
              <span>收起</span>
              <UpOutlined style="color: #2989ff" />
            </div>
          </div>
        </div>
      </a-form-item>
      <a-form-item label="广播内容" v-if="variableList.length">
        <div class="template">
          <div v-for="(item, index) in variableList" :key="index">
            <span v-if="templateCom(item) == 'span'" style="
                display: inline-block;
                width: 60%;
                word-wrap: break-word;
                white-space: normal;
              "> {{ item }}
            </span>
            <a-input :maxlength="20" style="width: 300px" v-else-if="
                templateCom(item) === 'address' || templateCom(item) === 'name'
              " v-model:value="templateParams[index].value" :placeholder="
                templateCom(item) === 'address' ? '请输入地址' : '请输入姓名'
              "></a-input>
            <component v-else style="width: 300px" :is="templateCom(item)" v-model:value="templateParams[index].value">
            </component>
          </div>
        </div>
      </a-form-item>
      <a-form-item label="广播方式">
        <a-select style="width: 300px" @change="modechange" v-model:value="modeInfo">
          <a-select-option value="xh">循环播放</a-select-option>
          <a-select-option value="cs">次数播放</a-select-option>
        </a-select>
      </a-form-item>
      <!-- -->
      <a-form-item label="广播次数" v-if="modeInfo == 'cs'">
        <a-input-number v-model:value="form.broadcastPlayNum" :max="99" :min="1"></a-input-number>
        <span class="unit">次</span>
      </a-form-item>
      <a-form-item label="播放时间" v-if="modeInfo == 'xh'">
        <a-range-picker show-time :allowClear="false" :disabled-date="disabledDate" @ok="timeok"
          v-model:value="timeperiod"></a-range-picker>
      </a-form-item>
    </a-form>
  </div>
  <div class="footer">
    <div class="primary" @click="submit">立即广播</div>
    <div class="cancel" @click="close">取消</div>
  </div>
</template>

<script>
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import { message } from "ant-design-vue";
import { DownOutlined, UpOutlined } from "@ant-design/icons-vue";
import curDate from "./components/curDate.vue";
import curTime from "./components/curTime.vue";
import phone from "./components/phone.vue";
import plateNo from "./components/plateNo.vue";
import genericText from "./components/genericText.vue";
import moment from "moment";
export default defineComponent({
  components: {
    DownOutlined,
    UpOutlined,
    genericText,
    curDate,
    curTime,
    phone,
    plateNo,
  },
  props: {
    value: {
      type: Object,
      default: null,
    },
    device: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      broadcastTemplate: [],
      currentTag: null,
      collapse: false,
      form: {
        broadcastPlayNum: 1,
      },
      templateParams: [],
    });
    // 将模板内容拆分
    const variableList = computed(() => {
      if (state.currentTag) {
        let reg = /\${[^}]*}|[^\${]+/g;
        let result = state.currentTag.content.match(reg);
        return result || [];
      } else {
        return [];
      }
    });
    // 匹配组件
    const templateCom = computed(() => (item) => {
      if (item.includes("${")) {
        let reg = /\$\{(.+?)\}/g;
        let result = reg.exec(item)[1];
        return result;
      } else {
        return "span";
      }
    });
    onMounted(() => {
      getBroadcastTemplateList();
    });
    const getBroadcastTemplateList = () => {
      proxy.$api
        .broadcastTemplatePage({ pageSize: 100, pageNumber: 1 })
        .then((res) => {
          state.broadcastTemplate = res.records.slice(0, 20);
        });
    };
    const clickCollapse = () => {
      state.collapse = !state.collapse;
    };
    const changeTemplate = (item) => {
      state.currentTag = item;
      state.templateParams = [];
      let list = variableList.value;
      list.forEach((element, index) => {
        let result = templateCom.value(element);
        if (result !== "span") {
          state.templateParams.push({
            name: result,
            value: null,
          });
        } else {
          state.templateParams.push(null);
        }
      });
    };
    const submit = () => {
      if (state.currentTag) {
        let newtemplateParams = JSON.parse(
          JSON.stringify(state.templateParams)
        );
        newtemplateParams = newtemplateParams.filter(
          (resdata) => resdata !== null
        );
        newtemplateParams = newtemplateParams.map(item => {
          return {
            ...item,
            value: item.value || ""
          }
        })
        const data = {
          id: state.currentTag.id,
          broadcastPlayNum:
            modeInfo.value == "xh" ? undefined : state.form.broadcastPlayNum,
          broadcastPlayVariableParams: newtemplateParams,
          broadcastPlayDevices:
            props.device.length == 0
              ? [
                {
                  id: props.value.id,
                  code: props.value.code,
                  name: props.value.deviceName,
                  thirdPartyCode: props.value.thirdPartyId,
                },
              ]
              : props.device,
          startTime:
            modeInfo.value == "xh"
              ? moment(timeperiod.value[0]).format("YYYY-MM-DD HH:mm:ss")
              : undefined,
          endTime:
            modeInfo.value == "xh"
              ? moment(timeperiod.value[1]).format("YYYY-MM-DD HH:mm:ss")
              : undefined,
        };
        if (modeInfo.value == "xh") {
          if (timeperiod.value.length == 0) {
            message.error("选择循环时间");
            return;
          }
          if (+timeperiod.value[0] == +timeperiod.value[1]) {
            message.error("结束时间必须大于开始时间");
            return;
          }
          proxy.$api.circulateBroadcast(data).then((res) => {
            close();
            message.success("操作成功！");
          });
        } else {
          proxy.$api.playBroadcast(data).then((res) => {
            close();
            message.success("操作成功！");
          });
        }
      } else {
        message.warning("请选择广播模板");
        // props.$message.warn("请选择广播模板");
      }
    };
    const close = () => {
      emit("close");
    };
    /**方式 */
    const modeInfo = ref("cs");
    const modechange = (data) => {
      modeInfo.value = data;
    };
    const timeperiod = ref([]);
    const disabledDate = (current) => {
      // Can not select days before today and today

      return current && current < moment().startOf("day");
    };

    return {
      disabledDate,
      timeperiod,
      modeInfo,
      modechange,
      ...toRefs(state),
      clickCollapse,
      changeTemplate,
      variableList,
      templateCom,
      submit,
      close,
    };
  },
});
</script>

<style lang="less" scoped>
.content {
  padding: 16px;
  height: 505px;
  overflow: auto;

  :deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
    background: transparent;
    border: 1px solid #374870;
    color: #ffffff;
  }

  :deep(.ant-calendar-picker-input.ant-input) {
    background: transparent;
    border: 1px solid #374870;
    color: #ffffff;
  }

  :deep(.ant-form-item-label > label) {
    color: #ffffff;
  }
}

.list-container {
  display: flex;
  justify-content: flex-end;
}

.collapse {
  width: 60px;
  color: #2989ff;
  cursor: pointer;
}

.list {
  flex: 1;
  display: flex;
  flex-wrap: wrap;

  &.open {
    height: auto;
  }

  &.away {
    height: 54px;
    overflow: hidden;
  }

  .tag {
    width: 92px;
    height: 36px;
    padding: 0 10px;
    line-height: 30px;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #d9e7ff;
    font-size: 14px;
    border: 1px solid rgba(217, 231, 255, 0.5);
    border-radius: 2px 2px 2px 2px;
    margin-right: 20px;
    margin-bottom: 20px;
    cursor: pointer;

    &:hover {
      border-color: #2989ff;
      color: #2989ff;
    }

    &.selected {
      background: #2989ff;
      border-color: #2989ff;
      color: #fff;
    }
  }
}

.footer {
  height: 80px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;

  >div {
    margin-right: 16px;
    height: 30px;
    line-height: 30px;
    background: #2989ff;
    padding: 0 16px;
    color: #ffffff;
    border-radius: 2px;
    cursor: pointer;

    &:hover {
      border: 1px solid #2989ff;
    }
  }

  .cancel {
    background: transparent;
    color: #2989ff;
    border: 1px solid #2989ff;
  }
}

.template {
  width: 100%;
  // display: flex;
  // flex-wrap: wrap;
  // align-items: center;
  background: #171b31;
  padding: 5px;
  height: 270px;
  overflow-y: auto;

  span {
    margin: 5px 0;
  }

  :deep(.ant-input) {
    background: transparent;
    border: 1px solid #2989ff;
    color: #ffffff;
  }
}

:deep(.ant-form-item-control-input-content) {
  color: #ffffff;

  .unit {
    color: #2989ff;
    font-size: 16px;
    margin-left: 10px;
  }
}

:deep(.ant-input-number) {
  background-color: transparent;
  color: #ffffff;
}
</style>
