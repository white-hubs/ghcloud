<template>
  <div class="play-box">
    <a-form ref="formRef" :rules="rules" class="play-form" :model="search">
      <a-form-item label="模板名称" name="id">
        <a-select @change="changeTemplate" style="width: 100px" v-model:value="search.id">
          <a-select-option :value="item.id" v-for="item in templateContent">{{ item.name }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="广播内容" v-if="variableList.length">
        <div class="template-box">
          <div class="template-item" v-for="(item, index) in variableList" :key="index">
            <span v-if="templateCom(item).name == 'span'" class="item-span"> {{ item }}
            </span>
            <a-input :maxlength="20" style="width: 300px" v-else-if="
                templateCom(item).name === 'address' || templateCom(item).name === 'name'
              " v-model:value="search.templateParams[index].value" :placeholder="
                templateCom(item).name === 'address' ? '请输入地址' : '请输入姓名'
              "></a-input>
            <component v-else style="width: 300px" :is="templateCom(item).component"
              v-model:value="search.templateParams[index].value">
            </component>
          </div>
        </div>
      </a-form-item>
      <a-form-item label="广播方式" name="type">
        <a-select @change="changeTemplate" style="width: 100px" v-model:value="search.type">
          <a-select-option :value="item.value" v-for="item in typeData">{{ item.label }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item v-if="search.type === 'number'" label="广播次数">
        <a-input-number v-model:value="search.number" :min="1" />
      </a-form-item>
      <a-form-item v-if="search.type === 'cycle'" label="播放时间" name="period">
        <a-config-provider :locale="zhCN">
          <a-range-picker v-model:value="search.period" value-format="YYYY-MM-DD" />
        </a-config-provider>
      </a-form-item>
    </a-form>
    <div class="play-but">
      <a-button type="primary" @click="immediatelyBroadcast">立即广播</a-button>
      <a-button style="margin-left: 10px;" @click="broadcastPlayStop">停止广播</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted, computed} from 'vue'
import { broadcastPlayText, broadcastPlayTextCirculate, broadcastPlayTextStop, broadcastTemplatePage } from "@/api/broadcast";
import zhCN from 'ant-design-vue/lib/locale/zh_CN';
import { message } from "ant-design-vue";
import curDate from "./components/curDate.vue";
import curTime from "./components/curTime.vue";
import phone from "./components/phone.vue";
import plateNo from "./components/plateNo.vue";
import genericText from "./components/genericText.vue";

const props = withDefaults(defineProps<{
  deviceDetail: any
}>(), {})
const formRef = ref();
const search = reactive({
  id: "",
  content:'',
  templateParams:[],
  type:'number',
  number:1,
  period:'',
});
const typeData = [
  {
    value: 'number',
    label: "次数播放"
  },
  {
    value: 'cycle',
    label: "循环播放"
  }
]
const rules = {
  id: [{ required: true, message: ""}],
  type: [{ required: true, message: "请选择模板"}],
  period: [{ required: true, message: "请选择播放时间"}],
};
const templateContent = ref([]);
// 将模板内容拆分
const variableList = computed(() => {
  if (search.content) {
    let reg = /\${[^}]*}|[^\${]+/g;
    let result = search.content.match(reg);
    return result || [];
  } else {
    return [];
  }
});
// 匹配组件
const templateCom = computed(() => (item) => {
  const componentMap = {
    curDate,
    curTime,
    phone,
    plateNo,
    genericText,
  };
  if (item.includes("${")) {
    let reg = /\$\{(.+?)\}/g;
    let result = reg.exec(item)[1];
    // let result = 'curDate';
    return {
      component: componentMap[result],
      name: result
      };
  } else {
    return {
      component: "span",
      name: "span"
      };
  }
});
const getBroadcastTemplatePage = async()=> {
  const res = await broadcastTemplatePage({
    pageNumber: 1,
    pageSize: 999
  })
  templateContent.value = res.records
}
const changeTemplate = (e) => {
  search.content = templateContent.value.find(item => item.id == e).content
  search.templateParams = [];
  let list = variableList.value;
  list.forEach((element, index) => {
    let result = templateCom.value(element);
    if (result.name !== "span") {
      search.templateParams.push({
        name: result.name,
        value: null,
      });
    } else {
      search.templateParams.push(null);
    }
  });
}
const broadcastPlayStop = async () => {
  await broadcastPlayTextStop({deviceId:props.deviceDetail.baseArchivesInfo.id})
  message.success("停止成功")
}
const immediatelyBroadcast = async () => {
  formRef.value.validate().then(async () => {
    let newTemplateParams = JSON.parse(JSON.stringify(search.templateParams));
    newTemplateParams = newTemplateParams.filter(
      (res) => res !== null
    );
    newTemplateParams = newTemplateParams.map(item => {
      return {
        ...item,
        value: item.value || ""
      }
    })
    const params:any = {
    id:search.id,
    broadcastTemplateCidontentParam:newTemplateParams,
    broadcastPlayDevices:[
      {
        id:props.deviceDetail.baseArchivesInfo.id,
        code:props.deviceDetail.baseArchivesInfo.code,
        name:props.deviceDetail.baseArchivesInfo.name,
        thirdPartyCode:props.deviceDetail.baseArchivesInfo.thirdPartyId,
      }
    ]
    }

    if (search.type === 'number') {
      params.broadcastPlayNum = search.number
      await broadcastPlayText(params)
    }else{
      params.startTime = search.period[0]
      params.endTime = search.period[1]
      await broadcastPlayTextCirculate(params)
    }
    message.success("下发成功")
  }).catch((err) => {
  })
}
onMounted(()=>{
  getBroadcastTemplatePage()
})
</script>
<style lang="less" scoped>
.play-box {
  position: relative;

  .play-form {
    height: 300px;
    overflow-y: auto;
  }

  .play-but {
    text-align: right;
  }
}

.item-span {
  display: inline-block;
  width: 60%;
  word-wrap: break-word;
  white-space: normal;
  color: #fff;
}

.template-box {
  .template-item {
    margin-bottom: 5px;
  }
}
</style>