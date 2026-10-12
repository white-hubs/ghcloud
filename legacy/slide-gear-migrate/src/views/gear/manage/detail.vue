<template>
  <g-detail title="档位信息" :formList="formList" :api="api" :rules="rules" :afterGet="afterGet"
    :beforeSave="handleBeforeSave">
    <template #edit-item>
      <a-form-item label="档位位置" name="lntAndLat">
        <a-input style="width: 200px;" v-model:value="lntAndLat" :disabled="true" />
        <a-button type="primary" @click="searchEvent" v-if="!disabled">档位位置</a-button>
      </a-form-item>
      <!-- <a-form-item label="详细地址" name="lntAndLat" class="form-item">
          <a-textarea style="width: 300px;" v-model:value="locationDes"  />
        </a-form-item> -->
      <a-form-item label="附件" name="fileIds" class="a-form-item-100">
        <g-upload-file :file="fileList" :max="10" :size="20" ref="uploadFile" :disabled="disabled" :sceneCode="GLOBAL_SCENE_CODE.stallInfo" />
      </a-form-item>
    </template>
  </g-detail>
</template>

<script lang='jsx'>
import { defineComponent, ref, getCurrentInstance, reactive, toRefs, createVNode, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMapModal } from '@ghcloud/generic-component/src/map-modal/cube-map-modal'
import {GLOBAL_SCENE_CODE} from "@ghcloud/cube-file-service"
export default defineComponent({
  setup() {
    const { showMapModal } = useMapModal()
    const { proxy } = getCurrentInstance();
    const uploadFile = ref();
    const route = useRoute();
    const disabled = computed(() => {
      return route.query.type === "detail"
    })
    const state = reactive({
      api: {
        detail: "getStallId",
        add: "postStall",
        edit: "postStall",
      },
      fileList: [],
      lntAndLat: '',
      locationDes: '',
      gpsVisible: false,
      formList: [
        {
          title: "基本信息",
          form: [
            {
              label: "档位编号",
              value: "code",
            },
            {
              label: "档位名称",
              value: "name",
              maxlength: 20
            },
            {
              label: "档主名称",
              value: "masterName",
            },
            {
              label: "档主联系方式",
              value: "masterPhone",
            },
            {
              label: "档位类型",
              value: "type",
              detailValue: "typeName",
              component: "g-select",
              url: "getBoothTypeList",
              placeholder: "请选择",
              field: { id: "value", name: "label" },
            },
            {
              label: "所在区域",
              value: "areaIds",
              component: "gCascader",
              url: "getAreaList",
              detailValue: "areaNames",
              placeholder: "请选择",
              changeOnSelect: true,
              detailFun: (a) => {
                if (a && a.length > 0) {
                  return a.join("/");
                }
              },
            },
            {
              label: "具体位置",
              value: "location",
            },
            {
              label: "建筑面积",
              value: "builtUpArea",
              unit: "㎡",
            },
            {
              label: "实用面积",
              value: "practicalArea",
              unit: "㎡",
            },
            {
              label: "所属部门",
              value: "deptIds",
              component: "gCascader",
              url: "getOrganizations",
              detailValue: "deptNames",
              placeholder: "请选择",
              detailFun: (a) => {
                if (a && a.length > 0) {
                  return a.join("/");
                }
              },
            },
            {
              label: "出租状态",
              value: "leased",
              component: "a-switch",
              checkedValue: '已出租',
              unCheckedValue: '未出租',
              defaultValue: true,
              detailFun: (a) => {
                if (a) {
                  return "已出租";
                } else {
                  return "未出租";
                }
              },
            },
            {
              label: "出租属性",
              value: "leaseType",
              component: "a-switch",
              checkedValue: '可租',
              unCheckedValue: '不可租',
              defaultValue: true,
              detailFun: (a) => {
                if (a) {
                  return "可租";
                } else {
                  return "不可租";
                }
              },
            },
            {
              label: "档位状态",
              value: "enabled",
              component: "a-switch",
              defaultValue: true,
              detailFun: (a) => {
                if (a) {
                  return "启用";
                } else {
                  return "禁用";
                }
              },
            },
            {
              label: "模型编码",
              value: "visualizationCode",
              maxlength: 30
            },
            {
              label: "备注说明",
              value: "remark",
              component: "a-textarea",
            }
          ],
        },
      ],
      rules: {
        code: [
          {
            required: true,
            message: "请输入档位编号",
          },
        ],
        name: [
          {
            required: true,
            message: "请输入档位名称",
          },
        ],
        location: [
          {
            required: false,
            message: "请输入具体位置",
          },
        ],
        builtUpArea: [
          {
            required: true,
            message: "请正确输入(最多两位小数)",
            pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
          },
        ],
        visualizationCode: [
          {
            message: "请输入正确的档位编码(不可输入空格)",
            pattern: /^[^\s]*$/
          },
        ],
        practicalArea: [
          {
            required: false,
            message: "请正确输入(最多两位小数)",
            pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
          },
        ],
        type: [
          {
            required: true,
            message: "请选择档位类型",
          },
        ],
        areaIds: [
          {
            required: true,
            message: "请选择所在区域",
          },
        ],
        deptIds: [
          {
            required: true,
            message: "请选择所属部门",
          },
        ],
        masterPhone: [
          {
            message: '请输入正确的手机号',
            pattern: /^1[3456789]\d{9}$/
          }
        ],
        enabled: [
          {
            required: true,
            message: "请选择",
          },
        ],
        leaseType: [
          {
            required: true,
            message: "请选择",
          },
        ],
      },
    });
    const handleBeforeSave = async (values) => {
      return {
        ...values,
        files: uploadFile.value.fileList.map(item => item.uuid),
        stallExpand: {
          ...values.stallExpand,
          lntAndLat: state.lntAndLat,
          locationDes: state.locationDes,
        }
      }
    }
    const afterGet = (values) => {
      state.lntAndLat = values.stallExpand?.lntAndLat || ''
      state.locationDes = values.stallExpand?.locationDes || ''
      state.fileList = values.files
    }
    const searchEvent = () => {
      showMapModal({
        title:'添加地点',
        address:state.locationDes,
        center:{
          lng: state.lntAndLat.split(',')[0],
          lat: state.lntAndLat.split(',')[1]
        },
        modalConfirm:(data)=>{
          state.lntAndLat = `${data.lng},${data.lat}`
          state.locationDes = data.address
        }
      })
    }

    return {
      ...toRefs(state),
      handleBeforeSave,
      afterGet,
      searchEvent,
      uploadFile,
      disabled,
      GLOBAL_SCENE_CODE
    };
  },
});
</script>

<style lang="less" scoped>
.gps-map {
  width: 100%;
  height: 400px;
  margin-top: 10px;
}
</style>
