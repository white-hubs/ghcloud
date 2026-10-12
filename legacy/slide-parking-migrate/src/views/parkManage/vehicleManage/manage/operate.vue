<template lang="pug">
g-layout(
  :title="`车辆${type === 'add' ? '购卡' : '延期'}`")
  template(#content-table)
    .detail-form
      a-form(ref="form" :model="model" :rules="rules" layout="inline" )
        .item-title 车辆信息
        a-form-item(label="车牌号" name="plateNo")
          a-select(
            v-model:value="model.plateNo"
            :dropdownStyle="{display: 'none'}"
            @click="openModal('carList')"
            :dropdownClassName="'hide'"
            placeholder="请选择车辆"
            :disabled="type==='delay'"
            )
        a-form-item(label="车辆类型" name="")
          g-select(v-model:value="model.carTypeId" disabled :url="'carTypeConfigList'" :field="{carTypeName: 'label', id: 'value'}" placeholder="请选择车牌号")
        a-form-item(label="车主姓名" name="")
          a-input(v-model:value="model.carOwnerName" placeholder="请选择车牌号" disabled)
        a-form-item(label="电话号码" name="")
          a-input(v-model:value="model.phone" placeholder="请选择车牌号" disabled)
        .item-title 购卡信息
        a-form-item(label="车卡类型" name="choseCardType")
          a-select(
            v-model:value="model.choseCardType"
            @click="openModal('cardList')" 
            :dropdownClassName="'hide'" 
            :dropdownStyle="{display: 'none'}"  
            placeholder="请选择车卡类型"
            :labelInValue="true")
        a-form-item(label="收费金额" name="")
          g-select(v-model:value="model.cardAmount" disabled placeholder="请选择车卡类型")
        a-form-item(label="开始时间" name="startTime")
          a-date-picker(v-model:value="model.startTime" placeholder="请选择开始时间" :format="'YYYY-MM-DD HH:mm:ss'" :valueFormat="'YYYY-MM-DD HH:mm:ss'" showTime @change="startChange" :disabled="type==='delay'")
        a-form-item(label="结束时间" name="")
          a-date-picker(v-model:value="model.endTime" placeholder="请选择开始时间" disabled  :format="'YYYY-MM-DD HH:mm:ss'" :valueFormat="'YYYY-MM-DD HH:mm:ss'" showTime)
        template(v-if="type!=='add'")  
          a-form-item(label="补缴金额")
            a-input(v-model:value="model.addAmount" placeholder="请选择车卡类型" disabled)
  template(#footer-page)
    a-button(@click="goBack") 返回
    a-button(@click="submit" type='primary') 保存
  OldModalTable(
    v-model:value="visible" 
    :title="modalType === 'carList' ? '车辆列表' : '车卡列表'" 
    :url="modalType === 'carList' ? 'carInfo' : 'vehicleCardList'" 
    :columns="modalType === 'carList' ? columns : cardCol"
    :search="modalType === 'carList' ? search : cardSearch"
    :width="800" 
    :params="modalType === 'carList' ? {status: 'CHECK_PASS'} : null"
    @modal-save="save" 
    :searchLength="modalType === 'carList' ? 1 : 0"
    :selectedKeys="selectedKeys")
</template>

<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  watch,
  ref,
} from "vue";
import { millennial, timeFormat, dateAdd } from "@/utils/common";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();

    const form = ref();
    const type = route.query.type;
    const id = route.query.id;

    const state = reactive({
      model: {
        carId: "",
        carOwnerName: "", //车主
        carTypeId: "", //车型
        plateNo: null, //车牌
        phone: "", //电话
        cardId: "", //车卡类型
        cardAmount: "", //价格
        startTime: null, //开始时间
        endTime: null, //结束时间
        duration: 0, //车卡时间
        cardName: "", //车卡名称
        choseCardType: {
          label: null,
          value: null,
        },
        addAmount: "",
      },
      carDuration: 0,
      alreadyPay: "",
      visible: false,
      columns: [
        {
          dataIndex: "carNo",
          title: "车牌号",
          slots: { customRender: "carNo" },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "carTypeName",
          title: "车型",
          slots: { customRender: "carTypeName" },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "driverName",
          title: "车主姓名",
          slots: { customRender: "driverName" },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "phone",
          title: "手机号",
          slots: { customRender: "phone" },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
      ],
      search: [
        { label: "", value: "keyword", placeholder: "车牌号/车主姓名/手机号" },
      ],
      selectedKeys: [],
      cardCol: [
        {
          dataIndex: "name",
          title: "车卡名称",
          slots: { customRender: "name" },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "price",
          title: "车卡价格",
          slots: { customRender: "price" },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text, true) : ""}
              >
                {text || text === 0 ? `￥${millennial(text, true)}` : "--"}
              </PopOver>
            );
          },
        },
      ],
      cardSearch: [],
      cardSelectedKey: [],
      modalType: "",
      rules: {
        plateNo: [{ required: true, message: "请选择车辆" }],
        startTime: [{ required: true, message: "请选择开始时间" }],
        choseCardType: [
          { required: true, message: "请选择车卡类型" },
          {
            validator(rule, value) {
              if (value.value) {
                return Promise.resolve();
              } else {
                return Promise.reject("请选择车卡类型");
              }
            },
          },
        ],
      },
    });

    const getData = () => {
      if (id) {
        proxy.$api.vehicleId(id,"get" ).then((res) => {
          state.model.carId = res.carId;
          state.model.carOwnerName = res.carOwnerName;
          state.model.carTypeName = res.carTypeName;
          state.model.carTypeId = res.carTypeId;
          state.model.plateNo = res.plateNo;
          state.model.phone = res.phone;
          state.model.cardId = res.cardId;
          state.model.cardAmount = res.cardAmount;
          state.alreadyPay = res.cardAmount;
          state.model.startTime =
            type === "add"
              ? timeFormat(new Date(), true)
              : timeFormat(res.startTime, true);
          // state.model.endTime = timeFormat(res.endTime, true);
          state.model.cardName = res.cardName;
          state.model.duration = res.duration;
          state.carDuration = res.duration;
          state.model.choseCardType.label = res.cardName;
          state.model.choseCardType.value = res.cardId;
          state.model.addAmount = res.addAmount;
        });
      }
      // else {
      // state.model.startTime = timeFormat(new Date(), true);
      // }
    };

    const startChange = (value) => {
      if (state.model.duration) {
        state.model.endTime = timeFormat(
          dateAdd("m", Number(state.model.duration), new Date(value)),
          true
        );
      } else {
        proxy.$message.warn("请选择车卡类型");
        state.model.startTime = "";
      }
    };

    const openModal = async (type) => {
      state.modalType = await type;
      state.selectedKeys =
        type === "carList"
          ? state.model.carId
            ? [state.model.carId]
            : []
          : state.model.cardId
          ? [state.model.cardId]
          : [];
      state.visible = true;
    };

    const save = (selectedKeys, selectedRows) => {
      state.selectedKeys = selectedKeys;
      if (state.modalType === "carList") {
        state.model.carId = selectedRows[0].id; //车辆id
        state.model.plateNo = selectedRows[0].carNo; //车牌号
        state.model.phone = selectedRows[0].phone; //电话
        state.model.carOwnerName = selectedRows[0].driverName; //车主
        state.model.carTypeName = selectedRows[0].carTypeName; //车型名称
        state.model.carTypeId = selectedRows[0].carTypeId; //车型
      } else {
        if (type === "add") {
          state.model.choseCardType.label = selectedRows[0].name;
          state.model.choseCardType.value = selectedRows[0].id;
          state.model.cardId = selectedRows[0].id; //车卡类型
          state.model.cardName = selectedRows[0].name; //车卡类型名称
          state.model.cardAmount = selectedRows[0].price; //价格
          state.model.duration = selectedRows[0].duration; //车卡时间
        } else {
          if (selectedRows?.length) {
            if (selectedRows[0].duration <= state.carDuration) {
              proxy.$message.error("延期卡片时间需长于当前卡片!");
              return;
            } else {
              state.model.choseCardType.label = selectedRows[0].name;
              state.model.choseCardType.value = selectedRows[0].id;
              state.model.cardId = selectedRows[0].id; //车卡类型
              state.model.cardName = selectedRows[0].name; //车卡类型名称
              state.model.cardAmount = selectedRows[0].price; //价格
              state.model.duration = selectedRows[0].duration; //车卡时间
            }
          }
        }
      }
    };

    const goBack = () => {
      history.back()
    };

    const submit = () => {
      form.value.validate().then(() => {
        // 购卡
        if (type === "add") {
          state.model.addAmount = 0;
          proxy.$api.vehicleAdd(state.model,"post" ).then(() => {
            proxy.$message.success("操作成功");
            goBack();
          });
        }
        // 延期
        else {
          proxy.$api
            .vehicleDelay({ id: id, ...state.model },"put" )
            .then(() => {
              proxy.$message.success("操作成功");
              goBack();
            });
        }
      });
    };

    onMounted(() => {
      getData();
    });

    watch(
      () => state.model.cardId,
      (n) => {
        if (n) {
          form.value.clearValidate("choseCardType");
        }
      }
    );
    watch(
      () => state.model.duration,
      (n, o) => {
        if (n != o && state.model.startTime && state.model.duration) {
          state.model.endTime = timeFormat(
            dateAdd("m", Number(n), new Date(state.model.startTime)),
            true
          );
        }
      }
    );

    watch(
      () => state.model.plateNo,
      (n) => {
        if (n) {
          form.value.clearValidate("plateNo");
        }
      }
    );
    watch(
      () => state.model.cardId,
      (n, o) => {
        if (o !== n) {
          state.model.addAmount = state.model.cardAmount - state.alreadyPay;
        }
      }
    );

    return {
      form,
      type,
      ...toRefs(state),
      startChange,
      openModal,
      goBack,
      submit,
      save,
    };
  },
});
</script>

<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
.hide {
  display: none;
}
</style>
