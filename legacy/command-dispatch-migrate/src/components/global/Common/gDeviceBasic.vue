<template>
  <div style="color: #fff">
    <div class="header-name">
      <div class="item-title">基本信息</div>
    </div>
    <div class="fireControlMsg">
      <div class="fireControlMsg-item">
        <div class="fireControlMsg-item-left">设备名称：</div>
        <div class="fireControlMsg-item-right">{{ deviceData.baseArchivesInfo.name }}</div>
      </div>
      <div class="fireControlMsg-item">
        <div class="fireControlMsg-item-left">设备型号：</div>
        <div class="fireControlMsg-item-right">
          {{ deviceData.productInfo.modelName||'--' }}
        </div>
      </div>

      <div class="fireControlMsg-item">
        <div class="fireControlMsg-item-left">设备品牌：</div>
        <div class="fireControlMsg-item-right">
          {{ deviceData.productInfo.brandName }}
        </div>
      </div>
      <div class="fireControlMsg-item">
        <div class="fireControlMsg-item-left">设备状态：</div>
        <div class="fireControlMsg-item-right">
          <span v-if="deviceData.baseArchivesInfo.status.onlineState===true" style="color: #5ccd4d">
            正常
          </span>
          <span v-if="deviceData.baseArchivesInfo.status.onlineState === false" style="color: #fba33f">
            离线
          </span>
          <span v-if="
              deviceData.baseArchivesInfo.status.onlineState  === null
            " style="color: #fba33f">
            暂无状态
          </span>
        </div>
      </div>
      <div class="fireControlMsg-item">
        <div class="fireControlMsg-item-left">所属区域：</div>
        <div class="fireControlMsg-item-right">
          {{ deviceData.baseArchivesInfo.area.name||'--'}}
        </div>
      </div>
      <div class="fireControlMsg-item">
        <div class="fireControlMsg-item-left">设备图片：</div>
        <div class="fireControlMsg-item-right bg">
          <a-image v-if="deviceData.image" :width="80" :height="80" :src="deviceData.image"></a-image>
        </div>
      </div>
    </div>
    <div v-if="readData.length">
      <div class="item-title">现场数据</div>
      <div class="fireControlMsg">
        <div class="fireControlMsg-item" v-for="(item, index) in readData" :key="index">
          <div class="fireControlMsg-item-left">{{ item.attributeName }}：</div>
          <div class="fireControlMsg-item-right">
            {{ item.value }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="readAndWritData.length">
      <div class="item-title">设备控制</div>
      <div class="fireControlMsg-control">
        <a-row :gutter="[16, 16]" style="margin-left: 0; margin-right: 0">
          <a-col :span="8" v-for="item in readAndWritData" :key="item.attributeCode">
            <div class="column">
              <switch-attribute v-if="item.dataType === 'boolean'" :attributeItem="item" :deviceId="props.deviceId"
                :curValue="attributeVlaue[item.attributeCode]"></switch-attribute>
              <enumerate-attribute v-else-if="item.dataType === 'enum'" :attributeItem="item" :deviceId="props.deviceId"
                :curValue="attributeVlaue[item.attributeCode]"></enumerate-attribute>
              <set-value-attribute v-else-if="['int', 'long', 'float', 'double'].includes(item.dataType)"
                :attributeItem="item" :deviceId="props.deviceId" :curValue="item.value"></set-value-attribute>
              <stringValueAttrbute v-else :attributeItem="item" :deviceId="props.deviceId"
                :curValue="attributeVlaue[item.attributeCode]"></stringValueAttrbute>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  ref,
  computed,
  watch,
} from "vue";
import { useStore } from "vuex";
import stringValueAttrbute from "../../deviceAttribute/stringValueAttrbute.vue";
export default defineComponent({
  name: "",
  props: {
    deviceId: {
      type: String,
      defalut: "",
    },
  },
  components: {
    stringValueAttrbute
  },
  setup(props, { emit }) {
    const store = useStore();
    const state = reactive({
      deviceData: {
        images: [],
        baseArchivesInfo: {
          status: {},
          area: {}
        },
        expandInfo: {},
        productInfo: {}
      },
      readData: [],
      readAndWritData: [],
      menuName: {},
      attributeVlaue: {},
    });
    const { proxy } = getCurrentInstance();
    // 获取设备属性
    const getBasicData = async () => {
      const result = await proxy.$api.getDeviceInstances({ deviceId: props.deviceId, withSnapShot: true, withPropertySpec: true })
      const data = await proxy.$api.getDeviceCenterInfo({ id: props.deviceId });
      if (data) {

        // 基础信息
        state.deviceData = data;
        if (data.productInfo.picture) {
          const file = await proxy.$api.fileId(data.productInfo.picture);
          state.deviceData.image = file.path
        }
        emit("detail", data);
        // 获取只读的属性
        const onlyRead = result.productPropVoList.filter(item => item.dataWrite === 0).map(item => item.propCode
        );
        // 现场只读
        state.readData = result.snapshots.filter(item => onlyRead.includes(item.key));
        const readWrite = result.productPropVoList.filter(item => item.dataWrite === 1).map(item => item.propCode)
        // 读写数据
        state.readAndWritData = result.snapshots.filter(item => readWrite.includes(item.key));
        // 将设备所有属性用对象包装起来，方便订阅过来的数据填充值
        result.productPropVoList.forEach(item => {
          state.attributeVlaue[item.propCode] = item.propName;
        })
        state.readData = state.readData.map(item => {
          return {
            ...item,
            attributeName: state.attributeVlaue[item.key],
            dataType: result.productPropVoList.find(i => i.propCode === item.key).dataType
          }
        })
        const getValueList = (item) => {
          const dataType = result.productPropVoList.find(i => i.propCode === item.key).dataType
          if (['int', 'long', 'float', 'double'].includes(dataType)) {
            return {
              valueMin: Math.min(...result.productPropVoList.find(i => i.propCode === item.key).dataConstraint),
              valueMax: Math.max(...result.productPropVoList.find(i => i.propCode === item.key).dataConstraint)
            }
          }
          if (dataType === 'boolean') {
            return {
              attributeKeyValueVos: result.productPropVoList.find(i => i.propCode === item.key).dataConstraint
            }
          }
          if (dataType === 'enum') {
            return {
              attributeKeyValueVos: result.productPropVoList.find(i => i.propCode === item.key).dataConstraint
            }
          }
          return {
            attributeKeyValueVos: []
          }
        }
        state.readAndWritData = state.readAndWritData.map(item => {
          return {
            ...item,
            attributeName: state.attributeVlaue[item.key],
            dataType: result.productPropVoList.find(i => i.propCode === item.key).dataType,
            ...getValueList(item)
          }
        })
        // result.forEach.map(
        //   item => ({ [item.code]: item.value })
        // );
        // 订阅设备数据
        // let params = {
        //   subscribeId: "equipment_monitor_attribute", //订阅id，前端通过该id判断是否为当前订阅
        //   subscribedDevices: data.deviceAttributes.map(item => {
        //     return {
        //       deviceInstanceId: data.detail.id,
        //       attributeCode: item.attributeCode,
        //     };
        //   }),
        // };
        // subscribeDeviceAttribute(params);
      }
    };
    const subscribeDeviceAttribute = params => {
      proxy.$api.subscribeDeviceAttribute(params).then(res => {
      });
    };
    onMounted(() => {
      getBasicData();
    });
    // 获取vuex订阅的实时数据
    const subscribeRealTimeData = computed(() => {
      return store.getters.realTimeData;
    });
    // 监听实时数据变化，判断是否为当前订阅id改变页面值
    watch(
      () => subscribeRealTimeData.value,
      val => {
        if (val.subscribeId === "equipment_monitor_attribute") {
          val.subscribedDevices.forEach(item => {
            if (state.attributeVlaue.hasOwnProperty(item.attributeCode)) {
              state.attributeVlaue[item.attributeCode] = item.attributeValue;
            }
          });
        }
      },
    );
    return {
      ...toRefs(state),
      props
    };
  },
});
</script>

<style scoped lang="less">
.fireControlMsg {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  flex-wrap: wrap;
  margin-bottom: 20px;

  .fireControlMsg-item {
    width: 30%;
    display: flex;
    justify-content: flex-start;
    margin-top: 20px;
    margin-left: 20px;
    font-size: 15px;

    .fireControlMsg-item-left {
      font-weight: 400;
    }

    .fireControlMsg-item-right {
      margin-left: 10px;
    }
  }

  .bg {
    width: 82px;
    height: 82px;
    background: #f8f8f8;
    border-radius: 4px 4px 4px 4px;
    opacity: 1;
    border: 1px solid #f2f2f2;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.item-title {
  width: 100%;
  height: 35px;
  line-height: 35px;
  text-align: left;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #fff;
  border-top: 1px solid #e8e8e88c;
  padding-top: 5px;
  font-family: "PingFang SC-Medium";

  &:first-child {
    border: none;
  }
}

.fireControlMsg-control {
  overflow-y: auto;

  .column {
    height: 50px;
    display: flex;
    align-items: center;
    // background: rgba(250, 250, 250, 1);
    padding: 0 16px;
  }
}
</style>
