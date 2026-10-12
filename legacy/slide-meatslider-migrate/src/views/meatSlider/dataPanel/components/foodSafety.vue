<template lang="pug">
.foodSafety
  .foodSafety-title 食安信息
  .foodSafety-content
    .foodSafety-btn
      a-button(:type="type==='TODAY'?'primary':null" @click="getData('TODAY')") 今日
      a-button(:type="type==='THIS_WEEK'?'primary':null" @click="getData('THIS_WEEK')") 本周
      a-button(:type="type==='THIS_MONTH'?'primary':null" @click="getData('THIS_MONTH')") 本月
      a-button(:type="type==='MONTH'?'primary':null" @click="getData('MONTH')") 近30天
    .foodSafety-data
      .data-item
        .item-info
          .item-name 供货商报备总数
          .item-num 
            span.num {{data.supplyReports}}
            span 项
        .item-icon
          img(src="../../../../assets/images/dataPanel1.png")
      .data-item
        .item-info
          .item-name 检疫票不合格数
          .item-num
            span.num.num2(@click="goPage('/quarantineSearch')") {{data.pratiqueFailed}}
            span 项
        .item-icon.color2
          img(src="../../../../assets/images/dataPanel3.png")
      .data-item
        .item-info
          .item-name 瘦肉精不合格数
          .item-num 
            span.num.num3(@click="goPage('/testResultSearch','clenbuterol')") {{data.clenbuterolFailed}}
            span 项
        .item-icon.color3
          img(src="../../../../assets/images/dataPanel4.png")
      .data-item
        .item-info
          .item-name 含水量不合格
          .item-num
            span.num.num4(@click="goPage('/testResultSearch','watered')") {{data.watered}}
            span 项
        .item-icon.color4
          img(src="../../../../assets/images/dataPanel2.png")
                         
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
} from "vue";
import moment from "moment";
import { timeFormat } from "@/utils/common";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      data: {
        clenbuterolFailed: 0,
        pratiqueFailIds: [],
        pratiqueFailed: 0,
        supplyReports: 0,
        watered: 0,
      },
      type: "TODAY",
    });
    const getData = (type) => {
      state.type = type;
      proxy.$api
        .getPorkStatSpotCheck({ type: state.type }, "get")
        .then((res) => {
          state.data = res;
        });
    };
    // 跳转页面
    const goPage = (url, params) => {
      let period = null;
      switch (state.type) {
        case "TODAY":
          period = [
            timeFormat(moment().format("YYYY-MM-DD 00:00:00"), false),
            timeFormat(moment().format("YYYY-MM-DD 23:59:59"), false),
          ].join(",");
          break;
        case "THIS_WEEK":
          period = [
            timeFormat(
              moment().day("Monday").format("YYYY-MM-DD 00:00:00"),
              false
            ),
            timeFormat(
              moment()
                .day("Monday")
                .day(+7)
                .format("YYYY-MM-DD 23:59:59"),
              false
            ),
          ].join(",");
          break;
        case "THIS_MONTH":
          period = [
            timeFormat(
              moment().startOf("month").format("YYYY-MM-DD 00:00:00"),
              false
            ),
            timeFormat(
              moment().endOf("month").format("YYYY-MM-DD 23:59:59"),
              false
            ),
          ].join(",");
          break;
        case "MONTH":
          period = [
            timeFormat(moment().subtract(29, "days"), false),
            timeFormat(moment(), false),
          ].join(",");
          break;

        default:
          break;
      }
      let obj = {};
      if (params) {
        obj[params] = "POSITIVE";
      }
      function getPushPath() {
        const pathname_arr = location.pathname.split('/')
        pathname_arr[pathname_arr.length - 1] = url
        const pathname = pathname_arr.join('/').replaceAll('//', '/')
        const query = {
          ...obj,
          period: period,
        }
        let queryString = ''
        for (const key in query) {
          if (Object.hasOwnProperty.call(query, key)) {
            const element = query[key];
            if (element) {
              queryString += `${queryString ? '&' : ''}${key}=${element}`
            }
          }
        }
        return `${pathname}${queryString ? '?' + queryString : ''}`
      }
      history.pushState({ current: location.pathname + location.search }, "", getPushPath())
    };
    onMounted(() => {
      getData("TODAY");
    });
    const getAbs = (num) => {
      return Math.abs(num);
    };
    return {
      ...toRefs(state),
      getAbs,
      getData,
      goPage,
    };
  },
});
</script>
<style lang="less" scoped>
.foodSafety {
  margin-top: 16px;
  height: 207px;
  background: #ffffff;
  border-radius: 0px 0px 0px 0px;
  margin-top: 16px;
  padding-left: 16px;
  padding-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .foodSafety-title {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    border-bottom: 1px solid #f3f3f3;
    font-size: 16px;
    font-family: PingFang SC-Regular, PingFang SC;
    font-weight: 550;
    color: #000000;
  }

  .foodSafety-content {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    .foodSafety-btn {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      width: 100%;

      .ant-btn {
        margin-right: 10px;
      }
    }

    .foodSafety-data {
      flex: 1;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      .data-item {
        flex: 1;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-around;

        &:last-child {
          &::before {
            border: none;
          }
        }

        &::before {
          content: "";
          position: absolute;
          top: 50%;
          right: 0;
          width: 1px;
          height: 35px;
          transform: translate(0, -50%);
          border-right: 1px dashed rgba(0, 0, 0, 0.2);
        }

        .item-icon {
          width: 64px;
          height: 64px;
          background: #e8fff9;
          border-radius: 12px 12px 12px 12px;
          opacity: 1;
          display: flex;
          align-items: center;
          justify-content: center;

          &.color2 {
            background-color: #fff7e6;
          }

          &.color3 {
            background-color: #ffeeee;
          }

          &.color4 {
            background-color: #e8ffff;
          }
        }

        .item-name {
          font-size: 14px;
          font-family: PingFang SC-Medium;
          font-weight: 500;
          color: #000000;
        }

        .item-num {
          font-size: 16px;
          font-family: PingFang SC-Medium;
          font-weight: 400;

          .num {
            font-size: 24px;
            font-family: PingFang SC-Medium;
            font-weight: bold;
            color: #262626;
            padding: 2px;
            border-radius: 4px;
            margin-right: 5px;
            cursor: pointer;

            &:hover {
              background-color: #e8fff9;
            }

            &.num2 {
              color: #fa8c16;

              &:hover {
                background-color: #fff7e6;
              }
            }

            &.num3 {
              color: #f5222d;

              &:hover {
                background-color: #ffeeee;
              }
            }

            &.num4 {
              color: #13c2c2;

              &:hover {
                background-color: #e8ffff;
              }
            }
          }
        }
      }
    }
  }
}
</style>
