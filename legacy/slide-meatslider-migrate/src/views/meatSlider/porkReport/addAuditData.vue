<template lang="pug">
div
  g-detail(
      title="新增来货报备"
      :formList="formList"
      :api="api"
      :rules="rules"
      :beforeSave="beforeSave"
    :afterGet="afterGet"
  )
</template>
<script>
import {
  defineComponent,
  reactive,
  getCurrentInstance,
  ref,
  toRefs,
  createVNode,
  onMounted,
} from "vue";
import { useRoute, useRouter } from "vue-router";
// import { porkReportId } from "@/api/meatSlider";
import { timeFormat, getFreshLabel } from "@/utils/common";
import { Modal } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
export default defineComponent({
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      data: null,
      originPlace: "",
      categoryOptions: [],
      formList: [
        {
          title: "报备信息",
          form: [
            { label: "商家名称", value: "supplierName", disabled: true },
            { label: "商家编号", value: "supplierCode", disabled: true },
            { label: "档位号", value: "stallName", disabled: true },
            { label: "报备单号", value: "code", disabled: true },
            {
              label: "报备时间",
              value: "reportTime",
              component: "a-date-picker",
            },
            {
              label: "商品品类",
              value: "goodsCategoryIds",
              component: "g-cascader",
              placeholder: "请选择商品品类",
              url: "getGoodsTypeList",
              field: {
                id: "value",
                name: "label",
              }
            },
            { label: "报备片数", value: "reportSlices" },
            { label: "报备重量", value: "reportWeight" },
            {
              label: "冷热鲜",
              value: "freshLabel",
              component: "g-select",
              options: [
                  {
                    value: "",
                    name: "请选择",
                    label: "请选择",
                  },
                  {
                    value: 'COLD_FRESH',
                    name: "冷鲜",
                    label: "冷鲜",
                  },
                  {
                    value: 'HOT_FRESH',
                    name: "热鲜",
                    label: "热鲜",
                  },
                  {
                    value: 'FROZEN',
                    name: "冻品",
                    label: "冻品",
                  },
              ],
              defaultValue: "",
              placeholder: "请选择冷热鲜",
            },
            { label: "车牌号", value: "vehiclePlate" },
            {
              label: "到场时间",
              value: "arrivedTime",
              component: "a-date-picker",
            },
          ],
        },
        {
          title: "产地检疫信息",
          form: [
            {
              label: "屠宰场",
              value: "abattoirId",
              component: "g-select",
              url: "getAbattoir",
              field: {
                id: "value",
                name: "label",
              },
              params: {
                pageSize: 1000,
                pageNumber: 1,
              },
            },
            { label: "养殖场", value: "originPlace", component: "a-input" },
            {
              label: "检疫证号",
              value: "pratiqueCode",
              detailFun: (value) => {
                return value ? value : "--";
              },
              placeholder: "格式:001-100,101-200",
            },
            {
              label: "检疫证",
              value: "fileVOS",
              fileList:[],
              max: 5,
              component: "g-upload",
              singleLine: true,
            },
          ],
        },
      ],
      api: {
        detail: "porkReportId",
        edit: "addPorkReport",
      },
      rules: {
        reportTime: [
          {
            required: true,
            message: "请选择报备时间",
            trigger: "change",
            type: "date",
          },
        ],
        goodsCategoryIds: [{ required: true, message: "请选择商品品类" }],
        reportSlices: [
          {
            required: true,
            message: "请输入报备片数",
            trigger: "change",
          },
        ],
        reportWeight: [
          {
            required: true,
            message: "请输入报备重量",
            trigger: "change",
          },
        ],
        freshLabel: [{ required: true, message: "请选择冷热鲜" }],
        vehiclePlate: [
          {
            required: true,
            message: "请输入车牌号码",
            trigger: "change",
          },
        ],
        arrivedTime: [
          {
            required: true,
            message: "请选择到场时间",
            trigger: "change",
            type: "date",
          },
        ],
        originPlace: [
          {
            required: true,
            message: "请输入养殖场",
            trigger: "change",
          },
        ],
        fileVOS: [
          {
            required: true,
            message: "请上传检疫证",
            trigger: "change",
          },
        ],
        abattoirId: [
          {
            required: true,
            message: "请选择屠宰场",
            trigger: "change",
          },
        ],
        pratiqueCode: [
          {
            required: true,
            message: "请输入检疫证号",
            trigger: "change",
          },
        ],
      },
    });
    const afterGet = (res) => {
      let fileList = res.files.map(item =>{
        return {
          uid: item.id,
          id: item.id,
          name: item.name,
          status: "done",
          url: item.path,
        }
      })
      return Object.assign({
        ...res,
        fileList:fileList,
        reportTime: timeFormat(res.reportTime, false),
        arrivedTime: timeFormat(res.arrivedTime, false),
        reportSlices: String(res.reportSlices),
        fileVOS: [],
        goodsCategoryIds: typeof res.goodsCategoryId === 'string' ? res.goodsCategoryId.split('-') : res.goodsCategoryId,
      });
    };
    const getp = (data, pid = null, res = []) => {
      data.forEach((element) => {
        res.push(element)
        if (element.children && element.children.length !== 0) {
          getp(element.children, element.id, res)
        }
      })
      return res
    }
    const getCategory = () => {
      proxy.$api.getGoodsTypeList().then((res) => {
        state.categoryOptions = getp(res)
      })
    };
    const beforeSave = (record) => {
      const goods = state.categoryOptions.filter((item) => item.id === record.goodsCategoryIds[record.goodsCategoryIds.length - 1])[0]
      const params = {
        supplierId: record.supplierId,
        stallId: record.stallId,
        abattoirId: record.abattoirId,
        reportSlices: record.reportSlices,
        reportWeight: record.reportWeight,
        reportTime: timeFormat(record.reportTime, false),
        arrivedTime: timeFormat(record.arrivedTime, false),
        vehiclePlate: record.vehiclePlate,
        pratiqueCodes: record.pratiqueCode.split(","),
        originPlace: record.originPlace,
        fileIds: record.fileVOS ? record.fileVOS.split(',') : [],
        goodsCategoryIds: record.goodsCategoryIds,
        goodsCategoryName: goods.name,
        freshLabel: record.freshLabel,
        freshName: getFreshLabel(record.freshLabel).name,
      };
      return params;
    };
    onMounted(() => {
      getCategory()
    });
    return {
      ...toRefs(state),
      route,
      timeFormat,
      beforeSave,
      afterGet,
      getp,
      getCategory
    };
  },
});
</script>
