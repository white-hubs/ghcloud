<template>
  <VanField
    v-if="props.readonly"
    :label="label"
    :required="props.required"
    :model-value="selected?.name"
    readonly />
  <template v-else>
  <VanField
    is-link
    :required="props.required"
    :model-value="selected?.name"
    readonly
    name="picker"
    :label="label"
    @click="handleShowPicker"
    placeholder="请选择"
    :error-message="errorMessage"
  />
  <VanPopup
    v-model:show="showPicker"
    position="right"
    duration="0.2"
  >
    <div class="object-select-pop">
      <VanNavBar
        class="nav"
        :title="modalTitle"
        left-text="返回"
        right-text=""
        @click-left="cancel"
      />
      <VanSearch
        v-model="searchValue"
        show-action
        placeholder="根据对象名称进行搜索"
        left-icon=""
      >
        <template #action>
          <div @click.stop="onClickSearchButton">搜索</div>
        </template>
      </VanSearch>
      <div class="list">
        <van-list
          :loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <van-cell
            v-for="item in datalist"
            :key="item.id"
            :title="item.name"
            @click="selectedCell = item"
          >
            <template #label>
              <span class="custom-title">
                所属区域：{{ item.areaName || item.areaNames || "--" }} </span
              ><br />
              <span class="custom-title"
                >类型：{{
                  item.typeName ||
                  item.genreName ||
                  (item.productInfo ? item.productInfo.name : "") ||
                  item.deviceCategory ||
                  "--"
                }}</span
              >
            </template>
            <template #right-icon>
              <VanCheckbox :model-value="selectedCell?.id === item.id" :shape="'round'" />
            </template>
          </van-cell>
        </van-list>
      </div>
      <div class="btn-area">
        <span>
          <template v-if="selectedCell?.id"> 已选择：{{ selectedCell?.name }} </template>
        </span>
        <VanButton type="primary" size="small" @click="confirm">确定</VanButton>
      </div>
    </div>
  </VanPopup>
  </template>
</template>
<script setup lang="ts">
import { FormItemExpose } from "../../../business/dynamic-table/form-item";
import { deviceService } from "../../../service/device/device";
import { cubeDeviceCenterService } from "../../../service/service";
import { showNotify } from "vant";
import { computed, onMounted, reactive, ref } from "vue";

const emits = defineEmits(["update:modelValue"]);
const props = defineProps<{
  required?: boolean;
  readonly?: boolean;
  label?: string;
  outSource: boolean;
  modelValue?: { id: string; name: string }[];
  dependFormValues: [string];
}>();

const modalTitle = computed(() => {
  return "选择对象";
});

/** 搜索 */
const onClickSearchButton = () => {
  page.pageNumber = 0;
  finished.value = false;
  datalist.value.length = 0;
  loading.value = false;
  onLoad();
};

const showPicker = ref(false);
function handleShowPicker() {
  if (props.readonly) {
    return;
  }
  if (props.modelValue && props.modelValue.length) {
    selectedCell.value = props.modelValue[0];
  } else {
    selectedCell.value = null;
  }
  showPicker.value = true;
}
const searchValue = ref("");
const selected = ref();
const selectedCell = ref();
const datalist = ref<Record<string, any>[]>([]);
const loading = ref(false);
const finished = ref(false);
const page = reactive({
  pageSize: 20,
  pageNumber: 0,
  pages: 0,
});
const onLoad = async () => {
  if (loading.value) {
    return;
  }
  page.pageNumber++;
  loading.value = true;
  finished.value = false;
  const params: Record<string, string | number | boolean | undefined> & {
    pageSize: number;
    pageNumber: number;
  } = {
    pageNumber: page.pageNumber,
    pageSize: page.pageSize,
    enabled: true,
    keyword: searchValue.value || undefined,
  };
  if (!props.outSource) {
    let { records } = await cubeDeviceCenterService.getDeviceInstancePageAll(params);
    records = records;
    datalist.value = datalist.value.concat(
      (records as unknown) as Record<string, string>[]
    );
    if (records.length < page.pageSize) {
      finished.value = true;
    }
  } else {
    const { records } = await deviceService.outsourceDevice(params);

    datalist.value = records.map((item) => {
      return {
        ...item,
        id: item.deviceId,
        name: item.deviceName,
      };
    });
    if (records.length < page.pageSize) {
      finished.value = true;
    }
  }

  loading.value = false;
};

function cancel() {
  showPicker.value = false;
}
function confirm() {
  if (!selectedCell.value?.id) {
    showNotify("请选择一项");
    return;
  }
  selected.value = selectedCell.value;
  showPicker.value = false;
  emits("update:modelValue", [{ id: selected.value.id, name: selected.value.name }]);
}

onMounted(async () => {
  if (props.modelValue && props.modelValue.length) {
    selected.value = props.modelValue[0];
  }
});

const errorMessage = computed(() => {
  return !validInput.value && props.required ? `请选择${props.label}` : "";
});

const validInput = ref(true);
defineExpose<FormItemExpose>({
  validate: () => {
    const valid = !!selected.value?.id;
    validInput.value = valid;
    return !!selected.value;
  },
});
</script>

<style scoped lang="less">
.object-select-pop {
  background-color: #fff;
  height: 100vh;
  width: 100vw;
  overflow: hidden;

  .list {
    width: 100%;
    height: calc(100% - 150px);
    overflow-y: scroll;
  }
  .btn-area {
    position: relative;
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.07);
    padding: 0 3vw;
    box-sizing: border-box;
  }
}
</style>
